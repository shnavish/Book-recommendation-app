import { NextResponse } from "next/server";
import { recommendationCache, SYSTEM_PROMPTS } from "@/lib/cache";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    
    // 1. Check Cache Layer (Phase 5: Reduce AI token cost and latency)
    const cacheKey = `rec_v27_${query.toLowerCase().trim()}`;
    const cachedResponse = recommendationCache.get(cacheKey);
    
    if (cachedResponse) {
      console.log("[Cache Hit] Returning cached recommendations for:", query);
      return NextResponse.json(
        { recommendations: cachedResponse, source: "cache" },
        { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
      );
    }
    
    // Function to fetch and map books using iTunes API to get accurate publisher descriptions
    const fetchBooks = async (searchQuery: string) => {
      // Fetch a larger pool of results to sort by popularity
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=ebook&limit=50`);
      const data = await res.json();
      if (!data.results || data.results.length === 0) return [];
      
      // Prioritize popular books over little known ones by sorting by user rating count
      data.results.sort((a: any, b: any) => (b.userRatingCount || 0) - (a.userRatingCount || 0));
      
      const seenTitles = new Set();
      // Filter out books that don't have a cover image, title, or description, and remove duplicate titles
      const validBooks = data.results.filter((item: any) => {
        if (!item.artworkUrl100 || !item.trackName || !item.description) return false;
        
        const lowercaseTitle = item.trackName.toLowerCase();
        
        // Exclude study guides, summaries, and workbooks
        if (
          lowercaseTitle.includes("summary of") ||
          lowercaseTitle.includes("summary &") ||
          lowercaseTitle.includes("workbook for") ||
          lowercaseTitle.includes("study guide") ||
          lowercaseTitle.includes("analysis of") ||
          lowercaseTitle.startsWith("summary:")
        ) {
          return false;
        }

        // Aggressively normalize title to catch duplicates like "(Unabridged)", ": A Novel"
        let normalizedTitle = lowercaseTitle.trim();
        normalizedTitle = normalizedTitle.replace(/\(.*?\)/g, ''); // Remove text in parentheses
        normalizedTitle = normalizedTitle.replace(/\[.*?\]/g, ''); // Remove text in brackets
        normalizedTitle = normalizedTitle.split(':')[0];           // Remove subtitles after colon
        normalizedTitle = normalizedTitle.split('-')[0];           // Remove subtitles after dash
        normalizedTitle = normalizedTitle.replace(/a novel/gi, ''); // Remove "a novel" if present
        normalizedTitle = normalizedTitle.trim();
        
        if (seenTitles.has(normalizedTitle)) return false;
        
        seenTitles.add(normalizedTitle);
        return true;
      });
      
      if (validBooks.length === 0) return [];

      return validBooks.slice(0, 10).map((item: any, index: number) => {
        // Strip HTML tags and decode HTML entities from publisher descriptions
        const cleanDescription = item.description
          ? item.description
              .replace(/<[^>]*>?/gm, '')
              .replace(/&#x[A-Fa-f0-9]+;/gi, ' ')
              .replace(/&#(\d+);/g, (_: string, dec: string) => String.fromCharCode(parseInt(dec, 10)))
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&nbsp;/g, ' ')
              .replace(/&rsquo;|&lsquo;/g, "'")
              .replace(/&rdquo;|&ldquo;/g, '"')
              .replace(/&mdash;/g, '-')
          : `A captivating exploration of themes related to your mood.`;
          
        return {
          id: item.trackId ? item.trackId.toString() : `book-${index}`,
          title: item.trackName || "Unknown Title",
          author: item.artistName || "Unknown Author",
          description: cleanDescription,
          reason: `Based on your request for "${searchQuery}", this book perfectly matches the aesthetic and emotional tone.`,
          matchScore: 98 - index * 5,
          tags: item.genres ? item.genres.slice(0, 3) : [searchQuery, "Fiction"],
          coverUrl: item.artworkUrl100.replace('100x100bb', '600x600bb'), // Get high-res cover
          purchaseLink: item.trackViewUrl || "#",
          amazonLink: `https://www.amazon.com/s?k=${encodeURIComponent((item.trackName || '') + ' ' + (item.artistName || ''))}`,
          flipkartLink: `https://www.flipkart.com/search?q=${encodeURIComponent((item.trackName || '') + ' ' + (item.artistName || ''))}`,
          padhegaLink: `https://padhegaindia.in/?post_type=product&s=${encodeURIComponent((item.trackName || '') + ' ' + (item.artistName || ''))}`,
        };
      });
    };

    // Map generic genres to specific iconic authors/titles because iTunes is a keyword search API
    let searchTerms = [query];
    
    // Try to use AI for semantic understanding of complex queries (e.g. "Sherlock Holmes but in India")
    try {
      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an expert book recommender. The user is looking for books based on this specific query: "${query}". Return a JSON array of exactly 10 of the MOST POPULAR, iconic, and culturally significant books.
For each book, return an object with the following fields:
- "title": The title of the book.
- "author": The author's name.
- "summary": A compelling 2-3 sentence summary of the book detailing its plot, central themes, and relevance to the user's request. Do not include spoilers.
- "tags": An array of 2-3 relevant genre or thematic tags.

CRITICAL RULE for genre: You MUST strictly adhere to the exact genre or format requested by the user. If the user asks for autobiographies, ALL 10 books MUST be autobiographies. If the user asks for non-fiction, do NOT include fiction.
CRITICAL RULE for "similar to" queries: If the user asks for books similar to a specific series (including common acronyms like LOTR, ASOIAF, HP), you MUST strictly follow this distribution:
1) First, identify the full name of the series from any acronyms.
2) NEVER include the main books of that referenced series.
3) You may include UP TO 5 spin-offs or prequels from the same universe ONLY if they fit the new constraint (e.g. The Hobbit).
4) The remaining books MUST be from COMPLETELY DIFFERENT authors and universes.
CRITICAL RULE for geography: Always interpret the term "Indian" as referring to the country of India (South Asia), not Native American.

Example JSON response:
[
  {
    "title": "1984",
    "author": "George Orwell",
    "summary": "A chilling dystopian masterpiece exploring totalitarian surveillance, propaganda, and individual resistance in a futuristic superstate.",
    "tags": ["Dystopian", "Classics", "Political Fiction"]
  }
]

Do not include any markdown formatting or wrapper, just the raw JSON array.`;
        
        const response = await ai.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: prompt,
        });
        
        if (response.text) {
           const jsonString = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
           const parsedTerms = JSON.parse(jsonString);
           if (Array.isArray(parsedTerms) && parsedTerms.length > 0) {
              searchTerms = parsedTerms;
              console.log("[AI Mapping] Successfully mapped query to:", searchTerms);
           }
        }
      } else {
        console.warn("[AI Mapping] GEMINI_API_KEY is missing. Falling back to manual mapper.");
      }
    } catch (error) {
      console.error("[AI Mapping Error] Falling back to manual map:", error);
    }
    
    // Fallback manual mapping if AI is not configured or fails
    if (searchTerms.length === 1 && searchTerms[0] === query) {
      const lowerQuery = query.toLowerCase().trim();
      
      // Use .includes() to aggressively catch all site categories, including variations with "&"
      if (lowerQuery.includes("indian") && (lowerQuery.includes("autobiography") || lowerQuery.includes("autobiographies"))) {
        searchTerms = [
          "Wings of Fire by A.P.J. Abdul Kalam", 
          "The Story of My Experiments with Truth by Mahatma Gandhi", 
          "Playing It My Way by Sachin Tendulkar", 
          "The Fall of a Sparrow by Salim Ali", 
          "Autobiography of a Yogi by Paramahansa Yogananda",
          "Waiting for a Visa by B.R. Ambedkar",
          "Childhood Days by Satyajit Ray",
          "The Race of My Life by Milkha Singh",
          "Unbreakable by Mary Kom",
          "Sunny Days by Sunil Gavaskar"
        ];
      } else if (lowerQuery.includes("indian")) {
        searchTerms = [
          "The God of Small Things by Arundhati Roy", 
          "The Namesake by Jhumpa Lahiri", 
          "Midnight's Children by Salman Rushdie",
          "A Fine Balance by Rohinton Mistry",
          "The White Tiger by Aravind Adiga",
          "Train to Pakistan by Khushwant Singh",
          "The Guide by R.K. Narayan",
          "The Palace of Illusions by Chitra Banerjee Divakaruni",
          "A Suitable Boy by Vikram Seth",
          "Interpreter of Maladies by Jhumpa Lahiri"
        ];
      } else if (lowerQuery.includes("mystery") || lowerQuery.includes("suspense")) {
        searchTerms = [
          "The Girl with the Dragon Tattoo by Stieg Larsson",
          "Gone Girl by Gillian Flynn",
          "The Da Vinci Code by Dan Brown",
          "And Then There Were None by Agatha Christie",
          "The Hound of the Baskervilles by Arthur Conan Doyle",
          "The Silent Patient by Alex Michaelides",
          "Big Little Lies by Liane Moriarty",
          "Rebecca by Daphne du Maurier",
          "The Girl on the Train by Paula Hawkins",
          "Shutter Island by Dennis Lehane"
        ];
      } else if (lowerQuery.includes("fantasy")) {
        searchTerms = [
          "The Hobbit by J.R.R. Tolkien",
          "The Way of Kings by Brandon Sanderson",
          "A Game of Thrones by George R.R. Martin",
          "The Name of the Wind by Patrick Rothfuss",
          "Harry Potter and the Sorcerer's Stone by J.K. Rowling",
          "Mistborn: The Final Empire by Brandon Sanderson",
          "American Gods by Neil Gaiman",
          "The Fellowship of the Ring by J.R.R. Tolkien",
          "The Priory of the Orange Tree by Samantha Shannon",
          "The Blade Itself by Joe Abercrombie"
        ];
      } else if (lowerQuery.includes("existential") || lowerQuery.includes("philosophy") || lowerQuery.includes("literary")) {
        searchTerms = [
          "The Stranger by Albert Camus",
          "Crime and Punishment by Fyodor Dostoevsky",
          "To the Lighthouse by Virginia Woolf",
          "Thus Spoke Zarathustra by Friedrich Nietzsche",
          "The Metamorphosis by Franz Kafka",
          "Nausea by Jean-Paul Sartre",
          "The Picture of Dorian Gray by Oscar Wilde",
          "The Brothers Karamazov by Fyodor Dostoevsky",
          "Man's Search for Meaning by Viktor Frankl",
          "Siddhartha by Hermann Hesse"
        ];
      } else if (lowerQuery.includes("academia") || lowerQuery.includes("thriller")) {
        searchTerms = [
          "The Secret History by Donna Tartt",
          "If We Were Villains by M.L. Rio",
          "Babel by R.F. Kuang",
          "Ninth House by Leigh Bardugo",
          "The Maidens by Alex Michaelides",
          "Bunny by Mona Awad",
          "The Lake of Dead Languages by Carol Goodman",
          "A Lesson in Vengeance by Victoria Lee",
          "Catherine House by Elisabeth Thomas",
          "Special Topics in Calamity Physics by Marisha Pessl"
        ];
      } else if (lowerQuery.includes("romance") || lowerQuery.includes("cozy")) {
        searchTerms = [
          "Pride and Prejudice by Jane Austen",
          "Book Lovers by Emily Henry",
          "The Flatshare by Beth O'Leary",
          "The Love Hypothesis by Ali Hazelwood",
          "Normal People by Sally Rooney",
          "Red, White & Royal Blue by Casey McQuiston",
          "Beach Read by Emily Henry",
          "The House in the Cerulean Sea by TJ Klune",
          "It Ends with Us by Colleen Hoover",
          "The Midnight Library by Matt Haig"
        ];
      } else if (lowerQuery.includes("sci-fi") || lowerQuery.includes("space") || lowerQuery.includes("science fiction")) {
        searchTerms = [
          "Dune by Frank Herbert",
          "Foundation by Isaac Asimov",
          "The Martian by Andy Weir",
          "Project Hail Mary by Andy Weir",
          "Neuromancer by William Gibson",
          "Ender's Game by Orson Scott Card",
          "Snow Crash by Neal Stephenson",
          "Hyperion by Dan Simmons",
          "The Left Hand of Darkness by Ursula K. Le Guin",
          "Leviathan Wakes by James S.A. Corey"
        ];
      } else if (lowerQuery.includes("historical") || lowerQuery.includes("time")) {
        searchTerms = [
          "The Pillars of the Earth by Ken Follett",
          "Wolf Hall by Hilary Mantel",
          "All the Light We Cannot See by Anthony Doerr",
          "The Book Thief by Markus Zusak",
          "The Seven Husbands of Evelyn Hugo by Taylor Jenkins Reid",
          "A Gentleman in Moscow by Amor Towles",
          "The Nightingale by Kristin Hannah",
          "Circe by Madeline Miller",
          "Kindred by Octavia Butler",
          "Pachinko by Min Jin Lee"
        ];
      }
    }

    let mockRecommendations: any[] = [];
    
    // Attempt 1: Fetch across our mapped terms
    if (searchTerms.length > 0 && searchTerms[0] !== query) {
      // AI successfully generated specific titles. We must strictly adhere to them.
      for (let i = 0; i < searchTerms.length; i++) {
        const term = searchTerms[i];
        
        let title = "";
        let author = "";
        let summary = "";
        let aiTags: string[] = [];
        let searchString = "";
        
        if (typeof term === 'object' && term !== null) {
          title = (term.title || "").trim();
          author = (term.author || "").trim();
          summary = (term.summary || term.description || "").trim();
          aiTags = Array.isArray(term.tags) ? term.tags : [];
          searchString = `${title} ${author}`;
        } else {
          const parts = String(term).split(/ by /i);
          title = parts[0].trim();
          author = parts[1] ? parts[1].trim() : "Unknown";
          searchString = String(term).replace(/ by /i, ' ');
        }
        
        let book = {
          id: `ai-rec-${i}`,
          title: title || String(term),
          author: author,
          description: summary || `This is a highly acclaimed book specifically recommended by our AI for your query: "${query}".`,
          reason: `A culturally significant and defining work that perfectly matches your request.`,
          matchScore: 98 - i * 2,
          tags: aiTags.length > 0 ? aiTags : ["Recommended", "AI Pick"],
          coverUrl: "",
          purchaseLink: "#",
          amazonLink: `https://www.amazon.com/s?k=${encodeURIComponent(title + ' ' + author)}`,
          flipkartLink: `https://www.flipkart.com/search?q=${encodeURIComponent(title + ' ' + author)}`,
          padhegaLink: `https://padhegaindia.in/?post_type=product&s=${encodeURIComponent(title + ' ' + author)}`,
        };
        
        // Enrich with iTunes safely
        try {
          const results = await fetchBooks(searchString);
          // Strong match validation to prevent iTunes from injecting random loose keyword matches
          const validMatch = results.find((r: any) => {
             // Remove articles and punctuation for a cleaner match
             const cleanAiTitle = title.toLowerCase().replace(/^(the|a|an)\s+/i, '').replace(/[^\w\s]/g, '').trim();
             const cleanItunesTitle = r.title.toLowerCase().replace(/^(the|a|an)\s+/i, '').replace(/[^\w\s]/g, '').trim();
             
             // Title must match strongly
             const tMatch = cleanItunesTitle.includes(cleanAiTitle) || cleanAiTitle.includes(cleanItunesTitle);
             
             // Author must have at least one significant matching word
             let aMatch = false;
             if (author !== "Unknown") {
                const cleanAiAuthor = author.toLowerCase().replace(/[^\w\s]/g, '').trim();
                const cleanItunesAuthor = r.author.toLowerCase().replace(/[^\w\s]/g, '').trim();
                const authorParts = cleanAiAuthor.split(/\s+/).filter(p => p.length > 2);
                if (authorParts.length > 0) {
                  aMatch = authorParts.some(p => cleanItunesAuthor.includes(p));
                } else {
                  aMatch = cleanItunesAuthor.includes(cleanAiAuthor);
                }
             } else {
                aMatch = true;
             }
             
             return tMatch && aMatch;
          });
          
          if (validMatch) {
             book.coverUrl = validMatch.coverUrl;
             // Only overwrite description if iTunes has a valid non-generic summary
             if (validMatch.description && !validMatch.description.includes("captivating exploration")) {
                book.description = validMatch.description;
             }
             book.purchaseLink = validMatch.purchaseLink;
             if (validMatch.tags && validMatch.tags.length > 0) book.tags = validMatch.tags;
          } else {
             // Fallback to OpenLibrary API if iTunes lacks the book
             try {
                const olRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchString)}&limit=1`);
                const olData = await olRes.json();
                if (olData.docs && olData.docs.length > 0 && olData.docs[0].cover_i) {
                   book.coverUrl = `https://covers.openlibrary.org/b/id/${olData.docs[0].cover_i}-L.jpg`;
                }
             } catch (e) {
                console.log("OpenLibrary fallback failed");
             }
          }
        } catch (e) {
          console.error("iTunes enrichment failed for", searchString);
        }
        
        mockRecommendations.push(book);
      }
    } else {
      // Manual fallback logic (Interleaved keyword search)
      const allResults = [];
      for (const term of searchTerms) {
        const optimizedTerm = term.replace(/ by /i, ' ');
        const results = await fetchBooks(optimizedTerm);
        allResults.push(results);
      }
      
      const maxLen = allResults.length > 0 ? Math.max(...allResults.map(arr => arr.length)) : 0;
      for (let i = 0; i < maxLen; i++) {
        for (const results of allResults) {
          if (results[i]) {
            mockRecommendations.push(results[i]);
          }
        }
      }
      
      const uniqueRecs = [];
      const seenFinalTitles = new Set();
      for (const rec of mockRecommendations) {
        const normTitle = rec.title.toLowerCase().trim();
        if (!seenFinalTitles.has(normTitle)) {
          seenFinalTitles.add(normTitle);
          uniqueRecs.push(rec);
        }
      }
      mockRecommendations = uniqueRecs.slice(0, 10);
      
      if (mockRecommendations.length === 0) {
        mockRecommendations = await fetchBooks(query + " book");
      }
    }

    // Attempt 3: Broad fallback
    if (mockRecommendations.length === 0) {
      mockRecommendations = await fetchBooks("bestselling fiction");
    }

    // Attempt 4: Absolute fallback (Hardcoded if API fails entirely)
    if (mockRecommendations.length === 0) {
      mockRecommendations = [
        {
          id: "fallback-1",
          title: "The Secret History",
          author: "Donna Tartt",
          description: "Under the influence of their charismatic classics professor, a group of clever, eccentric misfits at an elite New England college discover a way of thinking and living that is a world away from the humdrum existence of their contemporaries.",
          reason: "An absolute classic that explores deep philosophical themes and human nature.",
          matchScore: 95,
          tags: ["Dark Academia", "Mystery"],
          coverUrl: "https://covers.openlibrary.org/b/isbn/9781400031702-L.jpg",
          purchaseLink: "https://www.amazon.com/Secret-History-Donna-Tartt/dp/1400031702",
        },
        {
          id: "fallback-2",
          title: "Piranesi",
          author: "Susanna Clarke",
          description: "Piranesi's house is no ordinary building: its rooms are infinite, its corridors endless, its walls are lined with thousands upon thousands of statues, each one different from all the others.",
          reason: "An incredibly atmospheric and surreal journey that universally captivates readers.",
          matchScore: 90,
          tags: ["Fantasy", "Surreal"],
          coverUrl: "https://covers.openlibrary.org/b/isbn/9781635575637-L.jpg",
          purchaseLink: "https://www.amazon.com/Piranesi-Susanna-Clarke/dp/163557563X",
        }
      ];
    }

    // 2. Store in Cache Layer
    recommendationCache.set(cacheKey, mockRecommendations);

    return NextResponse.json(
      { recommendations: mockRecommendations, source: "generated" },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
    );
  } catch (error) {
    console.error("Recommendation API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
