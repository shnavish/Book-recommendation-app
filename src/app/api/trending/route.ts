import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const trendingBooksBase = [
      {
        id: "trend-1",
        title: "Fourth Wing",
        author: "Rebecca Yarros",
        coverColor: "from-amber-700 to-stone-900",
        source: "BookTok Sensation",
        trendScore: 99,
        tags: ["Fantasy", "Dragons", "Romantasy"],
      },
      {
        id: "trend-2",
        title: "The Women",
        author: "Kristin Hannah",
        coverColor: "from-sky-950 to-indigo-900",
        source: "Goodreads Choice Winner",
        trendScore: 98,
        tags: ["Historical Fiction", "Drama", "Bestseller"],
      },
      {
        id: "trend-3",
        title: "Yellowface",
        author: "R.F. Kuang",
        coverColor: "from-yellow-500 to-amber-600",
        source: "Goodreads / Reddit Debate",
        trendScore: 97,
        tags: ["Satire", "Thriller", "Modern Literature"],
      },
      {
        id: "trend-4",
        title: "House of Flame and Shadow",
        author: "Sarah J. Maas",
        coverColor: "from-purple-950 to-pink-900",
        source: "Goodreads #1 Fantasy",
        trendScore: 96,
        tags: ["Urban Fantasy", "Romance", "Epic Saga"],
      },
      {
        id: "trend-5",
        title: "Intermezzo",
        author: "Sally Rooney",
        coverColor: "from-emerald-950 to-teal-900",
        source: "New York Times Bestseller",
        trendScore: 95,
        tags: ["Literary Fiction", "Contemporary", "Drama"],
      },
      {
        id: "trend-6",
        title: "Funny Story",
        author: "Emily Henry",
        coverColor: "from-pink-800 to-rose-950",
        source: "BookTok Top Romance",
        trendScore: 94,
        tags: ["Romance", "Contemporary", "Comedy"],
      },
      {
        id: "trend-7",
        title: "Babel",
        author: "R.F. Kuang",
        coverColor: "from-stone-800 to-zinc-950",
        source: "BookTok Dark Academia",
        trendScore: 93,
        tags: ["Dark Academia", "Fantasy", "Historical"],
      },
      {
        id: "trend-8",
        title: "The Silent Patient",
        author: "Alex Michaelides",
        coverColor: "from-red-950 to-neutral-900",
        source: "Reddit / Goodreads Choice",
        trendScore: 92,
        tags: ["Psychological Thriller", "Mystery", "Suspense"],
      },
      {
        id: "trend-9",
        title: "Iron Flame",
        author: "Rebecca Yarros",
        coverColor: "from-amber-900 to-neutral-950",
        source: "Global Bestseller",
        trendScore: 91,
        tags: ["Fantasy", "Dragons", "Romantasy"],
      },
      {
        id: "trend-10",
        title: "A Court of Thorns and Roses",
        author: "Sarah J. Maas",
        coverColor: "from-green-950 to-stone-900",
        source: "All-Time BookTok Top",
        trendScore: 90,
        tags: ["Fantasy", "Romance", "Fae"],
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
