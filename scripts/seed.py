import sys
import os
import random
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.infra.db import (
    make_engine, make_session_factory, init_db,
    CohortRow, StudentRow, StudentSkillRow, EnrollmentRow, StudentConstraintRow,
    Base
)

def seed():
    engine = make_engine()
    init_db(engine)
    SessionFactory = make_session_factory(engine)
    
    with SessionFactory() as session:
        # Avoid dropping tables, just merge or delete specific ones if we want to be clean
        # For simplicity, we just delete everything
        session.query(EnrollmentRow).delete()
        session.query(StudentSkillRow).delete()
        session.query(StudentConstraintRow).delete()
        session.query(CohortRow).delete()
        session.query(StudentRow).delete()
        
        cohort_id = "SE1842"
        session.add(CohortRow(id=cohort_id, owner_id="lec1", name="Software Engineering Project"))
        
        cohort2_id = "AI2201"
        session.add(CohortRow(id=cohort2_id, owner_id="lec1", name="Applied Machine Learning"))

        session.commit()
        
        roles = ["frontend", "backend", "fullstack", "designer", "pm", "qa", "devops"]
        majors = ["SE", "AI", "IA", "DS"]
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        slots = ["Morning", "Afternoon", "Evening"]
        
        skills = ["React", "Vue", "Node.js", "Python", "Figma", "Docker", "SQL", "Java", "C++", "Go", "AWS", "TensorFlow"]
        
        # Seed 40 students
        for i in range(1, 41):
            s_id = f"st{i}"
            name = f"Student {i}"
            role = random.choice(roles)
            major = random.choice(majors)
            exp = round(random.uniform(0.5, 4.0), 1)
            
            avail = []
            for _ in range(random.randint(4, 10)):
                avail.append(f"{random.choice(days)} {random.choice(slots)}")
            
            student = StudentRow(
                id=s_id,
                name=name,
                major=major,
                experience_years=exp,
                desired_role=role,
                availability=json.dumps(list(set(avail)))
            )
            
            for sk in random.sample(skills, random.randint(3, 6)):
                student.skills.append(StudentSkillRow(skill_name=sk, proficiency=random.randint(2, 5)))
                
            session.add(student)
            
            # Enroll in SE1842
            session.add(EnrollmentRow(student_id=s_id, cohort_id=cohort_id))
            
            # Enroll some in AI2201
            if i % 2 == 0:
                session.add(EnrollmentRow(student_id=s_id, cohort_id=cohort2_id))
            
        session.commit()
        
        # Add some constraints
        c1 = StudentConstraintRow(id="c1", cohort_id=cohort_id, type="must_pair", student_a="st1", student_b="st2", status="approved")
        c2 = StudentConstraintRow(id="c2", cohort_id=cohort_id, type="cannot_pair", student_a="st3", student_b="st4", status="pending")
        c3 = StudentConstraintRow(id="c3", cohort_id=cohort_id, type="cannot_pair", student_a="st5", student_b="st6", status="approved")
        session.add_all([c1, c2, c3])
        session.commit()
        
        print("Database seeded successfully with 40 students, 2 cohorts, and 3 constraints.")

if __name__ == "__main__":
    seed()
