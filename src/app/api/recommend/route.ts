import { NextResponse } from "next/server";
import { recommendationCache, SYSTEM_PROMPTS } from "@/lib/cache";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    
    // 1. Check Cache Layer (Phase 5: Reduce AI token cost and latency)
    const lowerQuery = query.toLowerCase().trim();
    const isSurpriseQuery = lowerQuery === "surprise me" || 
                            lowerQuery === "surprise" || 
                            lowerQuery === "random" || 
                            lowerQuery.includes("surprise me") || 
                            lowerQuery.includes("random book") || 
                            lowerQuery.includes("anything") || 
                            lowerQuery.includes("choose for me");
    
    const cacheKey = `rec_v27_${lowerQuery}`;
    const cachedResponse = !isSurpriseQuery ? recommendationCache.get(cacheKey) : null;
    
    if (cachedResponse) {
      console.log("[Cache Hit] Returning cached recommendations for:", query);
      return NextResponse.json(
        { recommendations: cachedResponse, source: "cache" },
        { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
      );
    }
    
    let isAi = false;
    
    // Function to fetch and map books using iTunes API to get accurate publisher descriptions
    const fetchBooks = async (searchQuery: string) => {
      try {
        // Fetch a larger pool of results to sort by popularity
        const res = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=ebook&limit=50`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (!res.ok) {
          console.warn("[iTunes API] Non-OK response for:", searchQuery);
          return [];
        }
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
      } catch (error) {
        console.error("[fetchBooks] Failed to fetch from iTunes for:", searchQuery, error);
        return [];
      }
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
              isAi = true;
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
      if (
        lowerQuery === "surprise me" || 
        lowerQuery === "surprise" || 
        lowerQuery === "random" || 
        lowerQuery.includes("surprise me") || 
        lowerQuery.includes("random book") || 
        lowerQuery.includes("anything") ||
        lowerQuery.includes("choose for me")
      ) {
         const categoryPools = [
           { title: "The Simoqin Prophecies", author: "Samit Basu", tags: ["Epic Fantasy", "Indian Myth"] },
           { title: "The Immortals of Meluha", author: "Amish Tripathi", tags: ["Mythology", "Epic"] },
           { title: "The Hobbit", author: "J.R.R. Tolkien", tags: ["High Fantasy", "Classics"] },
           { title: "The Way of Kings", author: "Brandon Sanderson", tags: ["Epic Fantasy", "High Fantasy"] },
           { title: "The Secret History", author: "Donna Tartt", tags: ["Dark Academia", "Mystery"] },
           { title: "If We Were Villains", author: "M.L. Rio", tags: ["Dark Academia", "Thriller"] },
           { title: "Babel", author: "R.F. Kuang", tags: ["Dark Academia", "Historical Fantasy"] },
           { title: "And Then There Were None", author: "Agatha Christie", tags: ["Classic Mystery", "Whodunit"] },
           { title: "Gone Girl", author: "Gillian Flynn", tags: ["Psychological Thriller", "Suspense"] },
           { title: "The Silent Patient", author: "Alex Michaelides", tags: ["Psychological Thriller", "Mystery"] },
           { title: "Dune", author: "Frank Herbert", tags: ["Science Fiction", "Space Epic"] },
           { title: "Project Hail Mary", author: "Andy Weir", tags: ["Sci-Fi", "Space Adventure"] },
           { title: "Neuromancer", author: "William Gibson", tags: ["Cyberpunk", "Sci-Fi"] },
           { title: "Pride and Prejudice", author: "Jane Austen", tags: ["Classic Romance", "Literature"] },
           { title: "The House in the Cerulean Sea", author: "TJ Klune", tags: ["Cozy Fantasy", "Romance"] },
           { title: "Normal People", author: "Sally Rooney", tags: ["Contemporary", "Romance"] },
           { title: "The Stranger", author: "Albert Camus", tags: ["Existentialism", "Philosophy"] },
           { title: "The Metamorphosis", author: "Franz Kafka", tags: ["Surreal", "Absurdist"] },
           { title: "Man's Search for Meaning", author: "Viktor Frankl", tags: ["Psychology", "Philosophy"] }
         ];
         const shuffled = [...categoryPools].sort(() => 0.5 - Math.random());
         searchTerms = shuffled.slice(0, 10).map(b => ({
           title: b.title,
           author: b.author,
           summary: `A spectacular, highly recommended work selected randomly by our Surprise Me engine. Perfect for discovering outside your usual genres!`,
           tags: [...b.tags, "Surprise Pick", "Lucky Dip"]
         }));
      } else if (
        (lowerQuery.includes("romance") || lowerQuery.includes("cozy")) &&
        (lowerQuery.includes("sci-fi") || lowerQuery.includes("space") || lowerQuery.includes("science fiction"))
      ) {
        const pool = [
          "This Is How You Lose the Time War by Amal El-Mohtar",
          "The Time Traveler's Wife by Audrey Niffenegger",
          "The Host by Stephenie Meyer",
          "Defy the Stars by Claudia Gray",
          "Cinder by Marissa Meyer",
          "The Long Way to a Small, Angry Planet by Becky Chambers",
          "Shards of Honor by Lois McMaster Bujold",
          "Gideon the Ninth by Tamsyn Muir",
          "The Left Hand of Darkness by Ursula K. Le Guin"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (
        (lowerQuery.includes("academia") || lowerQuery.includes("secret history") || lowerQuery.includes("school")) &&
        (lowerQuery.includes("fantasy") || lowerQuery.includes("magic"))
      ) {
        const pool = [
          "Babel by R.F. Kuang",
          "Ninth House by Leigh Bardugo",
          "A Deadly Education by Naomi Novik",
          "The Atlas Six by Olivie Blake",
          "The Magicians by Lev Grossman",
          "The Starless Sea by Erin Morgenstern",
          "The Name of the Wind by Patrick Rothfuss"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (
        (lowerQuery.includes("existential") || lowerQuery.includes("philosophy")) &&
        (lowerQuery.includes("sci-fi") || lowerQuery.includes("space") || lowerQuery.includes("science fiction"))
      ) {
        const pool = [
          "Dune by Frank Herbert",
          "The Three-Body Problem by Cixin Liu",
          "Do Androids Dream of Electric Sheep? by Philip K. Dick",
          "Blindsight by Peter Watts",
          "Hyperion by Dan Simmons",
          "Solaris by Stanislaw Lem",
          "Anathem by Neal Stephenson"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (
        (lowerQuery.includes("historical") || lowerQuery.includes("time") || lowerQuery.includes("period")) &&
        (lowerQuery.includes("mystery") || lowerQuery.includes("suspense") || lowerQuery.includes("crime"))
      ) {
        const pool = [
          "The Name of the Rose by Umberto Eco",
          "The Shadow of the Wind by Carlos Ruiz Zafón",
          "The Alienist by Caleb Carr",
          "The Devil in the White City by Erik Larson",
          "The 7½ Deaths of Evelyn Hardcastle by Stuart Turton",
          "An Instance of the Fingerpost by Iain Pears"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (
        (lowerQuery.includes("romance") || lowerQuery.includes("cozy")) &&
        (lowerQuery.includes("fantasy") || lowerQuery.includes("magic"))
      ) {
        const pool = [
          "The House in the Cerulean Sea by TJ Klune",
          "Legends & Lattes by Travis Baldree",
          "A Court of Thorns and Roses by Sarah J. Maas",
          "Yumi and the Nightmare Painter by Brandon Sanderson",
          "The Very Secret Society of Irregular Witches by Sangu Mandanna",
          "The Starless Sea by Erin Morgenstern",
          "Half a Soul by Olivia Atwater"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (
        (lowerQuery.includes("academia") || lowerQuery.includes("secret history") || lowerQuery.includes("school")) &&
        (lowerQuery.includes("existential") || lowerQuery.includes("philosophy"))
      ) {
        const pool = [
          "The Picture of Dorian Gray by Oscar Wilde",
          "The Secret History by Donna Tartt",
          "The Stranger by Albert Camus",
          "If We Were Villains by M.L. Rio",
          "Crime and Punishment by Fyodor Dostoevsky",
          "The Metamorphosis by Franz Kafka"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (
        (lowerQuery.includes("mystery") || lowerQuery.includes("suspense") || lowerQuery.includes("crime")) &&
        (lowerQuery.includes("romance") || lowerQuery.includes("cozy"))
      ) {
        const pool = [
          "Rebecca by Daphne du Maurier",
          "Verity by Colleen Hoover",
          "The Maidens by Alex Michaelides",
          "The Guest List by Lucy Foley"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (lowerQuery.includes("indian") && (lowerQuery.includes("autobiography") || lowerQuery.includes("autobiographies"))) {
        const pool = [
          "Wings of Fire by A.P.J. Abdul Kalam", 
          "The Story of My Experiments with Truth by Mahatma Gandhi", 
          "Playing It My Way by Sachin Tendulkar", 
          "The Fall of a Sparrow by Salim Ali", 
          "Autobiography of a Yogi by Paramahansa Yogananda",
          "Waiting for a Visa by B.R. Ambedkar",
          "Childhood Days by Satyajit Ray",
          "The Race of My Life by Milkha Singh",
          "Unbreakable by Mary Kom",
          "Sunny Days by Sunil Gavaskar",
          "An Autobiography by Jawaharlal Nehru",
          "Truth, Love and a Little Malice by Khushwant Singh",
          "My Father's Garden by Hansda Sowvendra Shekhar",
          "I Am No Messiah by Sonu Sood"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (
        lowerQuery.includes("india") && 
        (lowerQuery.includes("fantasy") || 
         lowerQuery.includes("myth") || 
         lowerQuery.includes("lord of the rings") || 
         lowerQuery.includes("lotr") || 
         lowerQuery.includes("epic") || 
         lowerQuery.includes("hobbit") || 
         lowerQuery.includes("harry potter") || 
         lowerQuery.includes("magic"))
      ) {
        const pool = [
          {
            title: "The Simoqin Prophecies",
            author: "Samit Basu",
            summary: "A groundbreaking epic fantasy combining Western and Eastern mythologies. In a world facing the return of the dark dragon Simoqin, young heroes must embark on a legendary quest full of humor, magic, and adventure, heavily reminiscent of Lord of the Rings.",
            tags: ["Epic Fantasy", "Mythology", "Indian Fantasy"]
          },
          {
            title: "The Immortals of Meluha",
            author: "Amish Tripathi",
            summary: "An epic mythological retelling that transforms the Hindu deity Shiva into a mortal hero fighting ancient evils in the legendary land of Meluha. Filled with battles, philosophical depths, and ancient kingdoms.",
            tags: ["Mythology", "Epic", "Adventure"]
          },
          {
            title: "Sons of Darkness",
            author: "Gourav Mohanty",
            summary: "A dark, gritty epic fantasy described as Game of Thrones meets the Mahabharata. Set in a war-torn ancient India (Bharatvarsa), this massive saga features political intrigue, dark magic, and legendary warriors.",
            tags: ["Dark Fantasy", "Epic Saga", "Grimdark"]
          },
          {
            title: "The Palace of Illusions",
            author: "Chitra Banerjee Divakaruni",
            summary: "A breathtaking, award-winning retelling of the epic Mahabharata from the perspective of Panchaali (Draupadi). A rich, atmospheric blend of palace politics, divine magic, and ancient epic warfare.",
            tags: ["Epic Myth", "Historical", "Literary"]
          },
          {
            title: "Ajaya: Roll of the Dice",
            author: "Anand Neelakantan",
            summary: "A sweeping epic retelling of the Mahabharata from the perspective of the Kauravas. This deep, thought-provoking fantasy challenges traditional notions of hero and villain, offering an incredible scale of world-building.",
            tags: ["Epic Myth", "Political Fantasy", "Alternative History"]
          },
          {
            title: "The Forest of Enchantments",
            author: "Chitra Banerjee Divakaruni",
            summary: "A powerful mythological epic fantasy that retells the Ramayana from Sita's perspective, focusing on love, duty, and resilience in a world of gods, demons, and grand kingdoms.",
            tags: ["Mythological", "Epic Fantasy", "Classics"]
          },
          {
            title: "Scion of Ikshvaku",
            author: "Amish Tripathi",
            summary: "An epic fantasy retelling of the Ramayana following the outcast prince Ram as he fights against the corruption of the demon king Raavan in ancient India, blending history and mythology.",
            tags: ["Epic Fantasy", "Mythology", "Adventure"]
          },
          {
            title: "The Devourers",
            author: "Indra Das",
            summary: "A gorgeous, lyrical dark fantasy spanning centuries from seventeenth-century Mughal India to modern-day Kolkata, following shapeshifters and creatures of myth who live among humans.",
            tags: ["Dark Fantasy", "Literary", "Mythology"]
          },
          {
            title: "Lanka's Princess",
            author: "Anand Neelakantan",
            summary: "The story of Surpanakha, the sister of the demon king Raavan. A tragic, grand mythological fantasy exploring love, revenge, and the fall of the golden empire of Lanka.",
            tags: ["Epic Myth", "Fantasy", "Tragedy"]
          },
          {
            title: "The Harappa Files",
            author: "Samit Basu",
            summary: "A fast-paced sci-fi/fantasy thriller set in a futuristic, dystopian India. When a mysterious committee threat endangers the country, heroes with supernatural abilities must band together to prevent disaster.",
            tags: ["Urban Fantasy", "Sci-Fi Thriller", "Adventure"]
          }
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (lowerQuery.includes("india")) {
        const pool = [
          "The God of Small Things by Arundhati Roy", 
          "The Namesake by Jhumpa Lahiri", 
          "Midnight's Children by Salman Rushdie",
          "A Fine Balance by Rohinton Mistry",
          "The White Tiger by Aravind Adiga",
          "Train to Pakistan by Khushwant Singh",
          "The Guide by R.K. Narayan",
          "The Palace of Illusions by Chitra Banerjee Divakaruni",
          "A Suitable Boy by Vikram Seth",
          "Interpreter of Maladies by Jhumpa Lahiri",
          "The Covenant of Water by Abraham Verghese",
          "Tomb of Sand by Geetanjali Shree",
          "Shantaram by Gregory David Roberts",
          "The Shadow Lines by Amitav Ghosh"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (lowerQuery.includes("mystery") || lowerQuery.includes("suspense") || lowerQuery.includes("silent patient") || lowerQuery.includes("gone girl")) {
        const pool = [
          "The Girl with the Dragon Tattoo by Stieg Larsson",
          "Gone Girl by Gillian Flynn",
          "The Da Vinci Code by Dan Brown",
          "And Then There Were None by Agatha Christie",
          "The Hound of the Baskervilles by Arthur Conan Doyle",
          "The Silent Patient by Alex Michaelides",
          "Big Little Lies by Liane Moriarty",
          "Rebecca by Daphne du Maurier",
          "The Girl on the Train by Paula Hawkins",
          "Shutter Island by Dennis Lehane",
          "The Guest List by Lucy Foley",
          "In the Woods by Tana French",
          "Sharp Objects by Gillian Flynn",
          "The Cuckoo's Calling by Robert Galbraith"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (lowerQuery.includes("fantasy") || lowerQuery.includes("way of kings") || lowerQuery.includes("name of the wind") || lowerQuery.includes("fourth wing")) {
        const pool = [
          "The Hobbit by J.R.R. Tolkien",
          "The Way of Kings by Brandon Sanderson",
          "A Game of Thrones by George R.R. Martin",
          "The Name of the Wind by Patrick Rothfuss",
          "Harry Potter and the Sorcerer's Stone by J.K. Rowling",
          "Mistborn: The Final Empire by Brandon Sanderson",
          "American Gods by Neil Gaiman",
          "The Fellowship of the Ring by J.R.R. Tolkien",
          "The Priory of the Orange Tree by Samantha Shannon",
          "The Blade Itself by Joe Abercrombie",
          "The Eye of the World by Robert Jordan",
          "Gardens of the Moon by Steven Erikson",
          "Assassin's Apprentice by Robin Hobb",
          "The Lies of Locke Lamora by Scott Lynch"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (lowerQuery.includes("existential") || lowerQuery.includes("philosophy") || lowerQuery.includes("literary") || lowerQuery.includes("stranger") || lowerQuery.includes("metamorphosis") || lowerQuery.includes("nausea")) {
        const pool = [
          "The Stranger by Albert Camus",
          "Crime and Punishment by Fyodor Dostoevsky",
          "To the Lighthouse by Virginia Woolf",
          "Thus Spoke Zarathustra by Friedrich Nietzsche",
          "The Metamorphosis by Franz Kafka",
          "Nausea by Jean-Paul Sartre",
          "The Picture of Dorian Gray by Oscar Wilde",
          "The Brothers Karamazov by Fyodor Dostoevsky",
          "Man's Search for Meaning by Viktor Frankl",
          "Siddhartha by Hermann Hesse",
          "The Myth of Sisyphus by Albert Camus",
          "The Trial by Franz Kafka",
          "Waiting for Godot by Samuel Beckett",
          "Beyond Good and Evil by Friedrich Nietzsche"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (lowerQuery.includes("academia") || lowerQuery.includes("thriller") || lowerQuery.includes("secret history") || lowerQuery.includes("babel") || lowerQuery.includes("villains")) {
        const pool = [
          "The Secret History by Donna Tartt",
          "If We Were Villains by M.L. Rio",
          "Babel by R.F. Kuang",
          "Ninth House by Leigh Bardugo",
          "The Maidens by Alex Michaelides",
          "Bunny by Mona Awad",
          "The Lake of Dead Languages by Carol Goodman",
          "A Lesson in Vengeance by Victoria Lee",
          "Catherine House by Elisabeth Thomas",
          "Special Topics in Calamity Physics by Marisha Pessl",
          "A Deadly Education by Naomi Novik",
          "The Atlas Six by Olivie Blake",
          "Vicious by V.E. Schwab",
          "Ace of Spades by Faridah Àbíké-Íyímídé"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (lowerQuery.includes("romance") || lowerQuery.includes("cozy")) {
        const pool = [
          "Pride and Prejudice by Jane Austen",
          "Book Lovers by Emily Henry",
          "The Flatshare by Beth O'Leary",
          "The Love Hypothesis by Ali Hazelwood",
          "Normal People by Sally Rooney",
          "Red, White & Royal Blue by Casey McQuiston",
          "Beach Read by Emily Henry",
          "The House in the Cerulean Sea by TJ Klune",
          "It Ends with Us by Colleen Hoover",
          "The Midnight Library by Matt Haig",
          "Redeeming Love by Francine Rivers",
          "Emma by Jane Austen",
          "The Hating Game by Sally Thorne",
          "Funny Story by Emily Henry"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (lowerQuery.includes("sci-fi") || lowerQuery.includes("space") || lowerQuery.includes("science fiction")) {
        const pool = [
          "Dune by Frank Herbert",
          "Foundation by Isaac Asimov",
          "The Martian by Andy Weir",
          "Project Hail Mary by Andy Weir",
          "Neuromancer by William Gibson",
          "Ender's Game by Orson Scott Card",
          "Snow Crash by Neal Stephenson",
          "Hyperion by Dan Simmons",
          "The Left Hand of Darkness by Ursula K. Le Guin",
          "Leviathan Wakes by James S.A. Corey",
          "Children of Time by Adrian Tchaikovsky",
          "The Three-Body Problem by Cixin Liu",
          "The Hitchhiker's Guide to the Galaxy by Douglas Adams",
          "Dark Matter by Blake Crouch"
        ];
        searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      } else if (lowerQuery.includes("historical") || lowerQuery.includes("time")) {
        const pool = [
          "The Pillars of the Earth by Ken Follett",
          "Wolf Hall by Hilary Mantel",
          "All the Light We Cannot See by Anthony Doerr",
          "The Book Thief by Markus Zusak",
          "The Seven Husbands of Evelyn Hugo by Taylor Jenkins Reid",
          "A Gentleman in Moscow by Amor Towles",
          "The Nightingale by Kristin Hannah",
          "Circe by Madeline Miller",
          "Kindred by Octavia Butler",
          "Pachinko by Min Jin Lee",
          "The Book of Longings by Sue Monk Kidd",
          "The Shadow of the Wind by Carlos Ruiz Zafón",
          "Homegoing by Yaa Gyasi",
          "The Alice Network by Kate Quinn"
         ];
         searchTerms = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
      }
    }

    let mockRecommendations: any[] = [];
    
    // Attempt 1: Fetch across our mapped terms
    if (searchTerms.length > 0 && searchTerms[0] !== query) {
      // AI successfully generated specific titles. We must strictly adhere to them.
      const promises = searchTerms.map(async (term, i) => {
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
                const olRes = await fetch(
                  `https://openlibrary.org/search.json?q=${encodeURIComponent(searchString)}&limit=1`,
                  { signal: AbortSignal.timeout(3000) }
                );
                const olData = await olRes.json();
                if (olData.docs && olData.docs.length > 0 && olData.docs[0].cover_i) {
                   book.coverUrl = `https://covers.openlibrary.org/b/id/${olData.docs[0].cover_i}-L.jpg`;
                }
             } catch (e) {
                console.log("OpenLibrary fallback failed or timed out for:", searchString);
             }
          }
        } catch (e) {
          console.error("iTunes enrichment failed for", searchString, e);
        }
        
        return book;
      });
      
      mockRecommendations = await Promise.all(promises);
    } else {
      // Manual fallback logic (Interleaved keyword search in parallel)
      const fallbackPromises = searchTerms.map(async (term) => {
        const optimizedTerm = term.replace(/ by /i, ' ');
        return fetchBooks(optimizedTerm);
      });
      const allResults = await Promise.all(fallbackPromises);
      
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

    // 2. Store in Cache Layer (Only for AI-generated results to save quota, never cache manual shuffled sets or randoms)
    if (isAi && !isSurpriseQuery) {
      recommendationCache.set(cacheKey, mockRecommendations);
    }

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
