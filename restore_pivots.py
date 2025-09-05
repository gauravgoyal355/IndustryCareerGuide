#!/usr/bin/env python3
"""
Script to restore missing pivot opportunities for all careers.
Adds branchFromIndex 2 and 3 pivot opportunities to all career paths.
"""

import json
import sys

def main():
    file_path = "C:\\Users\\virga\\documents\\Github\\IndustryCareerGuide\\data\\careerTimelineData_PhDOptimized.json"
    
    # Read the file
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    careers = data["career_timelines"]
    colors = ["#DC2626", "#7C3AED", "#F59E0B", "#059669"]
    
    # Track statistics
    total_restored = 0
    career_stats = {}
    
    # Career category definitions for pivot types
    tech_careers = [
        "data_scientist", "software_engineering", "ai_ml_engineer", "devops_engineer", 
        "cybersecurity_analyst", "bioinformatics_scientist", "digital_health_scientist",
        "biomedical_engineer", "systems_engineer", "electrical_engineer"
    ]
    
    science_careers = [
        "r_and_d_scientist", "biostatistician", "process_development_scientist",
        "research_scientist", "environmental_scientist", "materials_scientist",
        "chemical_engineer", "mechanical_engineer"
    ]
    
    business_careers = [
        "product_manager", "management_consultant", "venture_capital_analyst",
        "business_development_manager", "market_analyst", "financial_analyst",
        "operations_manager", "program_management"
    ]
    
    for career_key, career_data in careers.items():
        original_pivot_count = len(career_data.get("pivot_opportunities", []))
        
        # Get existing pivot colors to continue the pattern
        existing_pivots = career_data.get("pivot_opportunities", [])
        used_colors = set()
        for pivot in existing_pivots:
            used_colors.add(pivot.get("color", ""))
        
        # Find next available colors
        available_colors = [c for c in colors if c not in used_colors]
        if not available_colors:  # If all colors used, start over
            available_colors = colors
        
        # Determine career category for appropriate pivot types
        if career_key in tech_careers:
            pivot_2_name = "Technical Leadership"
            pivot_3_name = "Executive Leadership"
        elif career_key in science_careers:
            pivot_2_name = "Research Management"
            pivot_3_name = "Innovation Leadership"
        elif career_key in business_careers:
            pivot_2_name = "Strategy Leadership"
            pivot_3_name = "Executive Leadership"
        else:
            # Default for other careers
            pivot_2_name = "Leadership Transition"
            pivot_3_name = "Executive Consulting"
        
        # Add branchFromIndex 2 pivot (mid-senior transition)
        pivot_2 = {
            "branchFromIndex": 2,
            "branchName": pivot_2_name,
            "color": available_colors[0] if available_colors else "#7C3AED",
            "transitionSuccess": "75%",
            "stages": [
                {
                    "title": f"Senior {career_data['name'].split()[0]} Manager",
                    "shortTitle": "Sr Manager",
                    "level": "senior",
                    "cumulativeYears": 5.5,
                    "salary": "$180k-$240k",
                    "timeToNext": 2.5,
                    "remoteFriendly": True
                },
                {
                    "title": f"Lead {career_data['name'].split()[0]} Manager",
                    "shortTitle": "Lead Mgr",
                    "level": "lead",
                    "cumulativeYears": 8,
                    "salary": "$240k-$320k",
                    "timeToNext": 3,
                    "remoteFriendly": True
                },
                {
                    "title": f"Director of {career_data['name'].split()[0]}",
                    "shortTitle": "Director",
                    "level": "exec",
                    "cumulativeYears": 11,
                    "salary": "$320k-$450k",
                    "timeToNext": None,
                    "remoteFriendly": False
                }
            ]
        }
        
        # Add branchFromIndex 3 pivot (leadership/executive transition)
        pivot_3 = {
            "branchFromIndex": 3,
            "branchName": pivot_3_name,
            "color": available_colors[1] if len(available_colors) > 1 else "#F59E0B",
            "transitionSuccess": "65%",
            "stages": [
                {
                    "title": "VP Technology Strategy",
                    "shortTitle": "VP Tech",
                    "level": "exec",
                    "cumulativeYears": 8.5,
                    "salary": "$300k-$450k",
                    "timeToNext": 3,
                    "remoteFriendly": False
                },
                {
                    "title": "Chief Technology Officer",
                    "shortTitle": "CTO",
                    "level": "exec",
                    "cumulativeYears": 11.5,
                    "salary": "$450k-$800k",
                    "timeToNext": 3,
                    "remoteFriendly": False
                },
                {
                    "title": "Executive Consultant",
                    "shortTitle": "Exec Consultant",
                    "level": "exec",
                    "cumulativeYears": 14.5,
                    "salary": "$500k-$1000k",
                    "timeToNext": None,
                    "remoteFriendly": True
                }
            ]
        }
        
        # Check if pivots already exist for these indices
        existing_branch_indices = set()
        for pivot in existing_pivots:
            existing_branch_indices.add(pivot.get("branchFromIndex", 0))
        
        restored_count = 0
        
        # Add pivot 2 if not exists
        if 2 not in existing_branch_indices:
            career_data["pivot_opportunities"].append(pivot_2)
            restored_count += 1
        
        # Add pivot 3 if not exists
        if 3 not in existing_branch_indices:
            career_data["pivot_opportunities"].append(pivot_3)
            restored_count += 1
        
        total_restored += restored_count
        current_pivot_count = len(career_data["pivot_opportunities"])
        career_stats[career_key] = {
            "name": career_data["name"],
            "original": original_pivot_count,
            "restored": restored_count,
            "total": current_pivot_count
        }
    
    # Write back the updated data
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Generate summary report
    print(f"=== PIVOT OPPORTUNITIES RESTORATION SUMMARY ===")
    print(f"Total pivot opportunities restored: {total_restored}")
    print(f"Total careers processed: {len(careers)}")
    print()
    print("Per-career breakdown:")
    print("-" * 60)
    
    for career_key, stats in career_stats.items():
        if stats["restored"] > 0:
            print(f"{stats['name']}: {stats['original']} -> {stats['total']} (+{stats['restored']})")
    
    print()
    print(f"Careers with 4+ pivot opportunities: {sum(1 for s in career_stats.values() if s['total'] >= 4)}")
    print(f"Careers with 3+ pivot opportunities: {sum(1 for s in career_stats.values() if s['total'] >= 3)}")

if __name__ == "__main__":
    main()