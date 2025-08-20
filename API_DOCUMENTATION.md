# API Documentation

## Overview
The IndustryCareerGuide API provides two lightweight serverless endpoints optimized for Vercel's free tier.

## Endpoints

### POST /api/matchCareer
Matches quiz answers to career paths and returns ranked recommendations.

**Request Body:**
```json
{
  "answers": {
    "skills_1": "a",
    "values_1": ["intellectual_challenge", "financial_reward", "work_life_balance", "social_impact"],
    "temperament_1": "4",
    "ambitions_1": "c",
    "skills_2": ["data_analysis", "project_leadership"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "careerPath": "data_scientist",
      "details": { "name": "Data Scientist", "description": "..." },
      "scores": { "skills": 0.8, "values": 0.7, "temperament": 0.6, "ambitions": 0.5 },
      "totalScore": 0.68,
      "score": 0.68,
      "matchLevel": "Good Match"
    }
  ],
  "metadata": {
    "totalCareers": 13,
    "timestamp": "2025-01-20T10:30:00.000Z"
  }
}
```

### POST /api/actionPlan
Generates personalized action plan based on career match and user profile.

**Request Body:**
```json
{
  "answers": { "skills_1": "a" },
  "topCareerMatch": "data_scientist",
  "userProfile": {
    "yearsExperience": 3,
    "hasPhD": true,
    "currentRole": "Postdoc",
    "targetTimeframe": "medium"
  }
}
```

**Response:**
```json
{
  "success": true,
  "actionPlan": {
    "overview": {
      "currentStage": "Postdoc/Early Career Researcher",
      "targetStage": "Data Scientist",
      "estimatedTimeframe": "9-15 months",
      "confidenceScore": 80
    },
    "milestones": {
      "immediate": {
        "title": "Foundation Building (0-3 months)",
        "priority": "high",
        "tasks": ["Complete skills assessment", "Update resume"]
      }
    },
    "skillDevelopment": {
      "immediate": ["Python programming", "Statistics"],
      "medium_term": ["Machine learning", "A/B testing"],
      "advanced": ["Strategic thinking", "Team leadership"]
    },
    "learningRecommendations": {
      "courses": [
        {
          "name": "Machine Learning Specialization",
          "provider": "Coursera (Stanford)",
          "duration": "3 months",
          "cost": "$49/month",
          "priority": "high"
        }
      ],
      "certifications": [],
      "estimatedCost": { "estimated_total": 2500 }
    },
    "resumeRecommendations": {
      "primaryRecommendation": {
        "title": "Industry-Focused Resume Optimization",
        "priority": "high"
      },
      "keyFocusAreas": ["Quantify research impact", "Highlight transferable skills"]
    },
    "careerInsights": {
      "strengths": ["Strong analytical skills", "Deep technical expertise"],
      "developmentAreas": ["Business communication", "Industry-specific skills"],
      "marketOutlook": "Data Scientist roles are expected to grow by 22%..."
    }
  }
}
```

## Error Responses

Both endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `400`: Invalid input/missing required fields
- `404`: Career path not found (actionPlan endpoint)
- `405`: Method not allowed (only POST accepted)
- `500`: Internal server error

## Rate Limiting
No rate limiting is implemented to maximize Vercel free tier usage. Consider implementing client-side request throttling for production use.

## Data Sources
- Quiz questions: `/data/quizQuestions.json`
- Career paths: `/data/careerPaths.json`  
- Career trajectories: `/data/careerTrajectories.json`

## Performance Optimization
- Functions are stateless and optimized for cold starts
- JSON data is imported statically for faster execution
- Minimal dependencies to reduce bundle size
- Efficient algorithms with O(n) complexity for scoring
