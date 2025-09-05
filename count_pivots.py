#!/usr/bin/env python3
import json
import sys

def count_pivots_per_career(file_path):
    """Count pivot opportunities for each career and identify those needing enhancement"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    careers = data.get('career_timelines', {})
    pivot_counts = {}
    careers_needing_enhancement = []
    
    for career_name, career_data in careers.items():
        pivot_ops = career_data.get('pivot_opportunities', [])
        pivot_count = len(pivot_ops)
        
        # Get branchFromIndex distribution
        branch_indices = [op.get('branchFromIndex', 0) for op in pivot_ops]
        branch_distribution = {}
        for idx in branch_indices:
            branch_distribution[idx] = branch_distribution.get(idx, 0) + 1
        
        pivot_counts[career_name] = {
            'total_pivots': pivot_count,
            'branch_distribution': branch_distribution,
            'needs_enhancement': pivot_count < 3
        }
        
        if pivot_count < 3:
            careers_needing_enhancement.append(career_name)
    
    # Print summary
    print("=== PIVOT OPPORTUNITIES ANALYSIS ===")
    print(f"Total careers: {len(careers)}")
    print(f"Careers needing enhancement: {len(careers_needing_enhancement)}")
    print()
    
    print("=== CAREERS NEEDING ENHANCEMENT ===")
    for career in careers_needing_enhancement:
        info = pivot_counts[career]
        print(f"{career}: {info['total_pivots']} pivots, branches: {info['branch_distribution']}")
    
    print()
    print("=== ALL CAREER PIVOT COUNTS ===")
    for career, info in sorted(pivot_counts.items()):
        status = "NEEDS ENHANCEMENT" if info['needs_enhancement'] else "OK"
        print(f"{career}: {info['total_pivots']} pivots, branches: {info['branch_distribution']} [{status}]")
    
    return pivot_counts, careers_needing_enhancement

if __name__ == "__main__":
    file_path = sys.argv[1] if len(sys.argv) > 1 else "careerTimelineData_PhDOptimized.json"
    pivot_counts, careers_needing_enhancement = count_pivots_per_career(file_path)