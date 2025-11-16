/**
 * BAD-WORDS FILTER TESTING & CUSTOMIZATION GUIDE
 * This file shows how to test and verify the bad-words filter is working
 */

const Filter = require('bad-words');

// ============================================
// 1. BASIC FILTER (Default bad words)
// ============================================
console.log("\n=== 1. BASIC FILTER (Default Bad Words) ===");
const basicFilter = new Filter();

const testComments = [
  "This product is great!",
  "This product sucks and is garbage",
  "I hate this, it's worthless",
  "Amazing quality, highly recommend!",
  "This is a scam, totally fake",
];

testComments.forEach(comment => {
  const cleaned = basicFilter.clean(comment);
  console.log(`\nOriginal:  "${comment}"`);
  console.log(`Filtered:  "${cleaned}"`);
  console.log(`Has Bad Words: ${comment !== cleaned ? '✓ YES' : '✗ NO'}`);
});

// ============================================
// 2. CUSTOM BAD WORDS (Like in ReviewController)
// ============================================
console.log("\n\n=== 2. WITH CUSTOM BAD WORDS ===");
const customFilter = new Filter();

// Add your custom bad words
const customBadWords = [
  'garbage',
  'worthless',
  'horrible',
  'waste',
  'scam',
  'fraud',
  'fake',
  'defective',
  'broken',
  'stolen',
  'liar',
  'cheater',
];

customBadWords.forEach(word => {
  customFilter.addWords(word);
});

const customTestComments = [
  "This product is horrible and defective",
  "The seller is a liar and cheater",
  "Worst waste of money, total fraud",
  "Great product, very satisfied!",
  "This is stolen goods, broken too",
];

customTestComments.forEach(comment => {
  const cleaned = customFilter.clean(comment);
  console.log(`\nOriginal:  "${comment}"`);
  console.log(`Filtered:  "${cleaned}"`);
  console.log(`Has Bad Words: ${comment !== cleaned ? '✓ YES' : '✗ NO'}`);
});

// ============================================
// 3. CUSTOM REPLACEMENT CHARACTER
// ============================================
console.log("\n\n=== 3. CUSTOM REPLACEMENT CHARACTERS ===");

// Using # instead of *
const hashFilter = new Filter();
hashFilter.addWords('garbage', 'waste', 'scam');
hashFilter.setPlaceHolder('#');

// Using & instead of *
const ampFilter = new Filter();
ampFilter.addWords('garbage', 'waste', 'scam');
ampFilter.setPlaceHolder('&');

const testComment = "This garbage is a waste and scam";

console.log(`\nOriginal:       "${testComment}"`);
console.log(`With * (default): "${basicFilter.clean(testComment)}"`);
console.log(`With #:          "${hashFilter.clean(testComment)}"`);
console.log(`With &:          "${ampFilter.clean(testComment)}"`);

// ============================================
// 4. CHECK IF WORD IS BAD
// ============================================
console.log("\n\n=== 4. CHECK IF WORD EXISTS IN BAD WORDS ===");
const checkFilter = new Filter();
checkFilter.addWords('garbage', 'scam', 'fake');

const wordsToCheck = ['garbage', 'product', 'scam', 'amazing', 'fake', 'great'];

wordsToCheck.forEach(word => {
  const isBad = checkFilter.isProfane(word);
  console.log(`"${word}": ${isBad ? '🚫 BAD WORD' : '✓ CLEAN'}`);
});

// ============================================
// 5. PRACTICAL EXAMPLE FOR REVIEWS
// ============================================
console.log("\n\n=== 5. PRACTICAL REVIEW FILTERING ===");

const reviewFilter = new Filter();
reviewFilter.addWords(
  'garbage', 'worthless', 'horrible', 'waste', 'scam', 'fraud', 'fake',
  'defective', 'broken', 'stolen', 'liar', 'cheater', 'ripoff', 'junk'
);

const customerReviews = [
  { rating: 5, comment: "Excellent product, very happy with purchase!" },
  { rating: 1, comment: "This is garbage and completely worthless, total scam!" },
  { rating: 2, comment: "Product arrived broken and defective. Worst waste of money!" },
  { rating: 4, comment: "Good quality, minor issues but overall satisfied." },
  { rating: 1, comment: "The seller is a liar! This fake garbage is not what was advertised!" },
];

console.log("\nProcessing customer reviews:");
customerReviews.forEach((review, idx) => {
  const cleanedComment = reviewFilter.clean(review.comment);
  const hadProfanity = review.comment !== cleanedComment;
  
  console.log(`\nReview ${idx + 1} (⭐${review.rating}):`);
  console.log(`  Original: "${review.comment}"`);
  console.log(`  Stored:   "${cleanedComment}"`);
  console.log(`  Status:   ${hadProfanity ? '🚫 FILTERED' : '✓ CLEAN'}`);
});

// ============================================
// 6. HOW TO USE IN YOUR CODE
// ============================================
console.log("\n\n=== 6. YOUR CURRENT IMPLEMENTATION ===");
console.log(`
In ReviewController.js:

const Filter = require('bad-words');
const filter = new Filter();

// Add your custom bad words
const customBadWords = [
  'garbage', 'worthless', 'horrible', 'waste', 'scam', 
  'fraud', 'fake', 'defective', 'broken', 'stolen'
];
customBadWords.forEach(word => filter.addWords(word));

// In createReview:
const cleanComment = filter.clean(comment);

// In updateReview:
const cleanComment = filter.clean(comment);

// The cleaned comment is then saved to database
// Profanity is automatically replaced with ***
`);

console.log("\n✅ TEST COMPLETE - Check your ReviewController logs when users post reviews!");
