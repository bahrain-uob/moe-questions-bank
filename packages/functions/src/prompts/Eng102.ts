export const ENG102PROMPT = `
{
  "instruction": "Generate a second-semester final exam for English 102 (Unified Tracks) based on the provided structure and requirements. the type of your response should be JSON OBJECT ONLY, return only the JSON object without additional descriptive text. follow the exact structure below.",
  "template": {
    "title": "English 102 Unified Tracks Second Semester Final Exam",
    "total_marks": 80,
    "time": "2 hours",
    "sections": [
      {
        "part": "1",
        "title": "Listening",
        "total_marks": 20,
        "subsections": [
          {
            "subsection": "A",
            "title": "Listening One",
            "marks": 10,
            "content": {
              "passage": "<200-word listening passage>",
              "audio": ""
              "questions": [
                {
                  "type": "multiple-choice",
                  "question": "<Question text>",
                  "options": ["<Option A>", "<Option B>", "<Option C>", "<Option D>"],
                  "answer": "<Correct option>"
                },
                { "type": "multiple-choice", "question": "<Question 2>", "options": ["<A>", "<B>", "<C>", "<D>"], "answer": "<Correct>" },
                { "type": "multiple-choice", "question": "<Question 3>", "options": ["<A>", "<B>", "<C>", "<D>"], "answer": "<Correct>" },
                { "type": "multiple-choice", "question": "<Question 4>", "options": ["<A>", "<B>", "<C>", "<D>"], "answer": "<Correct>" },
                { "type": "multiple-choice", "question": "<Question 5>", "options": ["<A>", "<B>", "<C>", "<D>"], "answer": "<Correct>" }
              ]
            }
          },
          {
            "subsection": "B",
            "title": "Listening Two",
            "marks": 10,
            "content": {
              "dialogue": "<150-word listening dialogue>",
              "questions": [
                {
                  "type": "fill-in-the-blank",
                  "sentence": "<Sentence 1 with a blank>",
                  "answer": "<Correct word or phrase>"
                },
                { "type": "fill-in-the-blank", "sentence": "<Sentence 2 with a blank>", "answer": "<Correct>" },
                { "type": "fill-in-the-blank", "sentence": "<Sentence 3 with a blank>", "answer": "<Correct>" },
                { "type": "fill-in-the-blank", "sentence": "<Sentence 4 with a blank>", "answer": "<Correct>" },
                { "type": "fill-in-the-blank", "sentence": "<Sentence 5 with a blank>", "answer": "<Correct>" }
              ]
            }
          }
        ]
      },
      {
        "part": "2",
        "title": "Reading",
        "total_marks": 30,
        "subsections": [
          {
            "subsection": "A",
            "title": "Reading Comprehension",
            "marks": 20,
            "content": {
              "passage": "<400-word reading passage>",
              "questions": {
                "multiple-choice": [
                  {
                    "question": "<Question 1>",
                    "options": ["<Option A>", "<Option B>", "<Option C>", "<Option D>"],
                    "answer": "<Correct option>"
                  },
                  { "question": "<Question 2>", "options": ["<A>", "<B>", "<C>", "<D>"], "answer": "<Correct>" },
                  { "question": "<Question 3>", "options": ["<A>", "<B>", "<C>", "<D>"], "answer": "<Correct>" },
                  { "question": "<Question 4>", "options": ["<A>", "<B>", "<C>", "<D>"], "answer": "<Correct>" },
                  { "question": "<Question 5>", "options": ["<A>", "<B>", "<C>", "<D>"], "answer": "<Correct>" }
                ],
                "true-false": [
                  { "statement": "<Statement 1>", "answer": "<True/False>" },
                  { "statement": "<Statement 2>", "answer": "<True/False>" },
                  { "statement": "<Statement 3>", "answer": "<True/False>" },
                  { "statement": "<Statement 4>", "answer": "<True/False>" },
                  { "statement": "<Statement 5>", "answer": "<True/False>" }
                ],
                "vocabulary-matching": [
                  { "word": "<Word 1>", "definition": "<Definition 1>" },
                  { "word": "<Word 2>", "definition": "<Definition 2>" },
                  { "word": "<Word 3>", "definition": "<Definition 3>" },
                  { "word": "<Word 4>", "definition": "<Definition 4>" },
                  { "word": "<Word 5>", "definition": "<Definition 5>" }
                ]
              }
            }
          },
          {
            "subsection": "B",
            "title": "Use of English",
            "marks": 10,
            "content": {
              "exercises": [
                {
                  "type": "grammar",
                  "question": "<Grammar question 1>",
                  "answer": "<Correct answer>"
                },
                { "type": "grammar", "question": "<Grammar question 2>", "answer": "<Correct>" },
                { "type": "vocabulary", "question": "<Vocabulary question 3>", "answer": "<Correct>" },
                { "type": "vocabulary", "question": "<Vocabulary question 4>", "answer": "<Correct>" },
                { "type": "vocabulary", "question": "<Vocabulary question 5>", "answer": "<Correct>" }
              ]
            }
          }
        ]
      },
      {
        "part": "3",
        "title": "Writing",
        "total_marks": 30,
        "content": {
          "questions": [
            {
              "type": "opinion-essay",
              "prompt": "<Essay question>",
              "word_limit": "150-200 words"
            },
            {
              "type": "descriptive-narrative-essay",
              "prompt": "<Essay question>",
              "word_limit": "150-200 words"
            }
          ]
        }
      }
    ]
  },
  "notes": "Ensure the JSON response adheres strictly to this format, with placeholders where content needs to be generated dynamically. Do not include any additional text outside the JSON object."
}
  

ontent and Difficulty:

- The exam should be at an intermediate level of difficulty, suitable for second-semester English 102 students Bahrain Secondary Schools Students.
- The listening passages should be clear and well-paced, with a variety of accents and speaking rates.
- The reading passages should be informative and engaging, with a variety of question types to assess comprehension.
- The grammar and vocabulary exercises should cover a range of topics and be challenging but achievable.
- The writing prompts should be clear and specific, allowing students to demonstrate their critical thinking and writing skills.

Layout and Formatting:

- The exam should be formatted similarly to the provided examples, with clear headings, instructions, and spacing.
- The title of the exam, "English 102 Unified Tracks Second Semester Final Exam," should be centered at the top of the first page.
- The page numbers should be located in the top right corner of each page.
- Return the final exam as a JSON response only, do not include any other text.
`;

// Note the prompt must be changed and organized as JSON template with instructions 
