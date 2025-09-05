#!/usr/bin/env python3
"""
Script to enhance pivot opportunities in PhD-optimized career dataset.
This script adds more diverse pivot opportunities at different career stages.
"""

import json
import sys
from typing import Dict, List, Any

def load_career_data(file_path: str) -> Dict[str, Any]:
    """Load the career timeline JSON data."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_career_data(data: Dict[str, Any], file_path: str) -> None:
    """Save the enhanced career timeline JSON data."""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_pivot_templates() -> Dict[str, List[Dict[str, Any]]]:
    """Define pivot opportunity templates for different career types."""
    
    colors = ["#DC2626", "#7C3AED", "#F59E0B", "#059669"]  # red, purple, gold, teal
    
    # Templates for different types of careers
    templates = {
        # Tech/Engineering careers
        'tech': [
            {
                'index': 1, 'name': 'Technical Leadership', 'color': colors[0], 'success': '85%',
                'roles': [
                    {'title': 'Tech Lead', 'short': 'Tech Lead', 'level': 'senior', 'years_offset': 0.5, 'salary': '+$20k-$40k'},
                    {'title': 'Engineering Manager', 'short': 'Eng Mgr', 'level': 'lead', 'years_offset': 2.5, 'salary': '+$40k-$80k'},
                    {'title': 'Director of Engineering', 'short': 'Eng Dir', 'level': 'exec', 'years_offset': 5, 'salary': '+$80k-$150k'}
                ]
            },
            {
                'index': 2, 'name': 'Product & Strategy', 'color': colors[1], 'success': '75%',
                'roles': [
                    {'title': 'Technical Product Manager', 'short': 'Tech PM', 'level': 'senior', 'years_offset': 0.5, 'salary': '+$10k-$30k'},
                    {'title': 'Senior Product Manager', 'short': 'Sr PM', 'level': 'lead', 'years_offset': 3, 'salary': '+$30k-$60k'},
                    {'title': 'VP Product', 'short': 'VP Product', 'level': 'exec', 'years_offset': 5, 'salary': '+$100k-$200k'}
                ]
            },
            {
                'index': 3, 'name': 'Executive Leadership', 'color': colors[2], 'success': '65%',
                'roles': [
                    {'title': 'VP of Engineering', 'short': 'VP Eng', 'level': 'exec', 'years_offset': 1, 'salary': '+$50k-$100k'},
                    {'title': 'Chief Technology Officer', 'short': 'CTO', 'level': 'exec', 'years_offset': 3, 'salary': '+$100k-$250k'}
                ]
            },
            {
                'index': 2, 'name': 'Consulting & Advisory', 'color': colors[3], 'success': '70%',
                'roles': [
                    {'title': 'Principal Consultant', 'short': 'Principal', 'level': 'senior', 'years_offset': 0.5, 'salary': '+$20k-$50k'},
                    {'title': 'Partner', 'short': 'Partner', 'level': 'exec', 'years_offset': 4, 'salary': '+$80k-$200k'}
                ]
            }
        ],
        
        # Science/Research careers  
        'science': [
            {
                'index': 1, 'name': 'Industry Research Leadership', 'color': colors[0], 'success': '80%',
                'roles': [
                    {'title': 'Senior Research Scientist', 'short': 'Sr Research', 'level': 'senior', 'years_offset': 0.5, 'salary': '+$15k-$35k'},
                    {'title': 'Research Director', 'short': 'Research Dir', 'level': 'lead', 'years_offset': 3, 'salary': '+$50k-$100k'},
                    {'title': 'Chief Scientific Officer', 'short': 'CSO', 'level': 'exec', 'years_offset': 6, 'salary': '+$100k-$200k'}
                ]
            },
            {
                'index': 2, 'name': 'Product & Commercialization', 'color': colors[1], 'success': '70%',
                'roles': [
                    {'title': 'Product Development Manager', 'short': 'Product Dev', 'level': 'senior', 'years_offset': 0.5, 'salary': '+$10k-$25k'},
                    {'title': 'VP Product Development', 'short': 'VP Product', 'level': 'lead', 'years_offset': 3.5, 'salary': '+$40k-$80k'},
                    {'title': 'Chief Product Officer', 'short': 'CPO', 'level': 'exec', 'years_offset': 6, 'salary': '+$80k-$150k'}
                ]
            },
            {
                'index': 3, 'name': 'Entrepreneurship', 'color': colors[2], 'success': '60%',
                'roles': [
                    {'title': 'Co-Founder/CTO', 'short': 'Co-Founder', 'level': 'exec', 'years_offset': 1, 'salary': 'Equity-based'},
                    {'title': 'CEO/Founder', 'short': 'CEO', 'level': 'exec', 'years_offset': 3, 'salary': 'Equity + $150k-$300k'}
                ]
            },
            {
                'index': 1, 'name': 'Consulting & Advisory', 'color': colors[3], 'success': '75%',
                'roles': [
                    {'title': 'Scientific Consultant', 'short': 'Consultant', 'level': 'senior', 'years_offset': 0, 'salary': '+$20k-$40k'},
                    {'title': 'Principal Consultant', 'short': 'Principal', 'level': 'lead', 'years_offset': 3, 'salary': '+$50k-$100k'},
                    {'title': 'Partner', 'short': 'Partner', 'level': 'exec', 'years_offset': 6, 'salary': '+$100k-$250k'}
                ]
            }
        ],
        
        # Business/Management careers
        'business': [
            {
                'index': 1, 'name': 'Strategic Leadership', 'color': colors[0], 'success': '80%',
                'roles': [
                    {'title': 'Strategy Manager', 'short': 'Strategy Mgr', 'level': 'senior', 'years_offset': 0.5, 'salary': '+$15k-$30k'},
                    {'title': 'Director of Strategy', 'short': 'Strategy Dir', 'level': 'lead', 'years_offset': 3, 'salary': '+$40k-$80k'},
                    {'title': 'VP Strategy', 'short': 'VP Strategy', 'level': 'exec', 'years_offset': 6, 'salary': '+$80k-$150k'}
                ]
            },
            {
                'index': 2, 'name': 'Operations Leadership', 'color': colors[1], 'success': '75%',
                'roles': [
                    {'title': 'Operations Manager', 'short': 'Ops Mgr', 'level': 'senior', 'years_offset': 0.5, 'salary': '+$10k-$25k'},
                    {'title': 'Director of Operations', 'short': 'Ops Dir', 'level': 'lead', 'years_offset': 3, 'salary': '+$30k-$60k'},
                    {'title': 'Chief Operating Officer', 'short': 'COO', 'level': 'exec', 'years_offset': 6, 'salary': '+$100k-$200k'}
                ]
            },
            {
                'index': 3, 'name': 'Executive Leadership', 'color': colors[2], 'success': '65%',
                'roles': [
                    {'title': 'VP Business Development', 'short': 'VP BizDev', 'level': 'exec', 'years_offset': 1, 'salary': '+$50k-$100k'},
                    {'title': 'Chief Executive Officer', 'short': 'CEO', 'level': 'exec', 'years_offset': 4, 'salary': '+$150k-$400k'}
                ]
            },
            {
                'index': 2, 'name': 'Investment & Finance', 'color': colors[3], 'success': '70%',
                'roles': [
                    {'title': 'Investment Manager', 'short': 'Investment', 'level': 'senior', 'years_offset': 0.5, 'salary': '+$20k-$50k'},
                    {'title': 'Principal/Partner', 'short': 'Partner', 'level': 'exec', 'years_offset': 4, 'salary': '+$100k-$300k'}
                ]
            }
        ]
    }
    
    return templates

def categorize_career(career_name: str, career_data: Dict[str, Any]) -> str:
    """Categorize a career into tech, science, or business based on name and industries."""
    name_lower = career_name.lower()
    industries = [ind.lower() for ind in career_data.get('targetIndustries', [])]
    
    # Tech keywords
    tech_keywords = ['engineer', 'developer', 'devops', 'software', 'ai', 'ml', 'data scientist', 'cybersecurity']
    if any(keyword in name_lower for keyword in tech_keywords):
        return 'tech'
    
    # Science keywords  
    science_keywords = ['scientist', 'research', 'bioinformatics', 'biostatistician', 'clinical', 'medical']
    if any(keyword in name_lower for keyword in science_keywords):
        return 'science'
        
    # Business default for others
    return 'business'

def create_pivot_opportunity(template: Dict[str, Any], base_stages: List[Dict[str, Any]], branch_index: int) -> Dict[str, Any]:
    """Create a pivot opportunity from a template."""
    if branch_index >= len(base_stages):
        branch_index = len(base_stages) - 1
        
    base_stage = base_stages[branch_index]
    
    pivot = {
        'branchFromIndex': branch_index,
        'branchName': template['name'],
        'color': template['color'],
        'transitionSuccess': template['success'],
        'stages': []
    }
    
    for i, role_template in enumerate(template['roles']):
        stage = {
            'title': role_template['title'],
            'shortTitle': role_template['short'],
            'level': role_template['level'],
            'cumulativeYears': base_stage['cumulativeYears'] + role_template['years_offset'] + (i * 2),
            'timeToNext': 3 if i < len(template['roles']) - 1 else None,
            'remoteFriendly': base_stage.get('remoteFriendly', True)
        }
        
        # Calculate salary based on base stage and offset
        if 'salary' in base_stage and role_template['salary'] != 'Equity-based' and not role_template['salary'].startswith('Equity'):
            try:
                base_min, base_max = [int(x.replace('$', '').replace('k', '000')) for x in base_stage['salary'].split('-')]
                if '+' in role_template['salary']:
                    offset_str = role_template['salary'].replace('+$', '').replace('+', '')
                    offset_min, offset_max = [int(x.replace('k', '000')) for x in offset_str.split('-')]
                    new_min = base_min + offset_min
                    new_max = base_max + offset_max
                    stage['salary'] = f"${new_min//1000}k-${new_max//1000}k"
                else:
                    stage['salary'] = role_template['salary']
            except:
                stage['salary'] = role_template['salary']
        else:
            stage['salary'] = role_template['salary']
        
        pivot['stages'].append(stage)
    
    return pivot

def enhance_career_pivots(career_data: Dict[str, Any], career_name: str) -> Dict[str, Any]:
    """Enhance pivot opportunities for a single career."""
    career_type = categorize_career(career_name, career_data)
    templates = get_pivot_templates()[career_type]
    
    # Get main path stages
    main_stages = career_data.get('main_path', [])
    if len(main_stages) < 3:
        print(f"Warning: {career_name} has less than 3 main stages, using available stages")
    
    # Create 3-4 pivot opportunities
    new_pivots = []
    for i, template in enumerate(templates[:4]):  # Limit to 4 pivots max
        pivot = create_pivot_opportunity(template, main_stages, template['index'])
        new_pivots.append(pivot)
    
    career_data['pivot_opportunities'] = new_pivots
    return career_data

def main():
    """Main function to enhance all career pivot opportunities."""
    file_path = 'C:/Users/virga/documents/Github/IndustryCareerGuide/data/careerTimelineData_PhDOptimized.json'
    
    print("Loading career data...")
    data = load_career_data(file_path)
    
    print("Enhancing pivot opportunities...")
    enhanced_careers = 0
    
    for career_key, career_data in data['career_timelines'].items():
        career_name = career_data.get('name', career_key)
        print(f"Enhancing {career_name}...")
        
        data['career_timelines'][career_key] = enhance_career_pivots(career_data, career_name)
        enhanced_careers += 1
    
    print(f"Enhanced {enhanced_careers} careers")
    
    # Update metadata
    data['metadata']['lastUpdated'] = '2025-08-31'
    data['metadata']['changeLog'].append('Enhanced pivot opportunities: 3-4 pivots per career, senior/leadership level pivots added')
    
    print("Saving enhanced data...")
    save_career_data(data, file_path)
    
    print("Enhancement complete!")
    
    # Print summary statistics
    total_pivots = sum(len(career['pivot_opportunities']) for career in data['career_timelines'].values())
    print(f"Total pivot opportunities: {total_pivots}")
    print(f"Average pivots per career: {total_pivots / len(data['career_timelines']):.1f}")

if __name__ == '__main__':
    main()