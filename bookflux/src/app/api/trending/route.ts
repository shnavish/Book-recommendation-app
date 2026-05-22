import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const trendingBooksBase = [
      {
        id: "trend-1",
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        coverColor: "from-red-900 to-yellow-900",
        source: "Global Bestseller",
        trendScore: 99,
        tags: ["Fantasy", "Magic", "Adventure"],
      },
      {
        id: "trend-2",
        title: "The Hunger Games",
        author: "Suzanne Collins",
        coverColor: "from-orange-800 to-black",
        source: "Pop Culture",
        trendScore: 98,
        tags: ["Dystopian", "Sci-Fi", "Action"],
      },
      {
        id: "trend-3",
        title: "Dune",
        author: "Frank Herbert",
        coverColor: "from-yellow-700 to-orange-900",
        source: "Sci-Fi Masterpiece",
        trendScore: 96,
        tags: ["Science Fiction", "Epic", "Adventure"],
      },
      {
        id: "trend-4",
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        coverColor: "from-green-900 to-emerald-950",
        source: "Classic Fantasy",
        trendScore: 95,
        tags: ["High Fantasy", "Quest", "Classic"],
      },
      {
        id: "trend-5",
        title: "The Da Vinci Code",
        author: "Dan Brown",
        coverColor: "from-red-950 to-stone-900",
        source: "Thriller Bestseller",
        trendScore: 94,
        tags: ["Thriller", "Mystery", "Conspiracy"],
      },
      {
        id: "trend-6",
        title: "A Game of Thrones",
        author: "George R.R. Martin",
        coverColor: "from-slate-800 to-blue-950",
        source: "Epic Fantasy",
        trendScore: 93,
        tags: ["Fantasy", "Political", "Epic"],
      },
      {
        id: "trend-7",
        title: "The Alchemist",
        author: "Paulo Coelho",
        coverColor: "from-yellow-600 to-orange-800",
        source: "Inspirational",
        trendScore: 92,
        tags: ["Fiction", "Philosophy", "Quest"],
      },
      {
        id: "trend-8",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        coverColor: "from-stone-700 to-stone-900",
        source: "Classic Literature",
        trendScore: 91,
        tags: ["Classic", "Historical", "Drama"],
      },
      {
        id: "trend-9",
        title: "1984",
        author: "George Orwell",
        coverColor: "from-blue-900 to-slate-900",
        source: "Dystopian Classic",
        trendScore: 90,
        tags: ["Dystopian", "Classic", "Sci-Fi"],
      },
      {
        id: "trend-10",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        coverColor: "from-yellow-900 to-black",
        source: "American Classic",
        trendScore: 89,
        tags: ["Classic", "Romance", "Historical"],
      }
    ];

    // Fetch enriched data from iTunes API
    const enrichedBooks = await Promise.all(trendingBooksBase.map(async (book) => {
      try {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(book.title + ' ' + book.author)}&media=ebook&limit=30`);
        const data = await res.json();
        
        let validItem = null;
        if (data.results && data.results.length > 0) {
          // Prioritize popular books over little known ones by sorting by user rating count
          data.results.sort((a: any, b: any) => (b.userRatingCount || 0) - (a.userRatingCount || 0));
          
          validItem = data.results.find((item: any) => {
            if (!item.trackName) return false;
            const lowercaseTitle = item.trackName.toLowerCase();
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
            return true;
          });
        }
        
        if (validItem) {
          const item = validItem;
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
            : `A highly anticipated trending book from ${book.source}.`;
            
          return {
            ...book,
            description: cleanDescription,
            coverUrl: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : null,
            purchaseLink: item.trackViewUrl || null,
            amazonLink: `https://www.amazon.com/s?k=${encodeURIComponent(book.title + ' ' + book.author)}`,
            flipkartLink: `https://www.flipkart.com/search?q=${encodeURIComponent(book.title + ' ' + book.author)}`,
            padhegaLink: `https://padhegaindia.in/?post_type=product&s=${encodeURIComponent(book.title + ' ' + book.author)}`
          };
        }
      } catch (e) {
        console.error("Failed to fetch iTunes data for", book.title);
      }
      
      // Fallback if iTunes fails
      return {
        ...book,
        description: `A highly anticipated trending book from ${book.source}.`,
        amazonLink: `https://www.amazon.com/s?k=${encodeURIComponent(book.title + ' ' + book.author)}`,
        flipkartLink: `https://www.flipkart.com/search?q=${encodeURIComponent(book.title + ' ' + book.author)}`,
        padhegaLink: `https://padhegaindia.in/?post_type=product&s=${encodeURIComponent(book.title + ' ' + book.author)}`
      };
    }));

    return NextResponse.json(
      { trending: enrichedBooks },
      { headers: { "Cache-Control": "public, s-maxage=10800, stale-while-revalidate=86400" } }
    );
  } catch (error) {
    console.error("Trending API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending books" },
      { status: 500 }
    );
  }
}
