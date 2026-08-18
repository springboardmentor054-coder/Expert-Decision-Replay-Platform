from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(tags=["Alternatives"])

@router.post("/decisions/{decision_id}/alternatives", response_model=schemas.AlternativeResponse, status_code=status.HTTP_201_CREATED)
def add_alternative(
    decision_id: int,
    alt_in: schemas.AlternativeCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    decision = db.query(models.Decision).filter(models.Decision.id == decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found.")
        
    if decision.creator_id != current_user.id and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this decision.")

    if decision.status in ["Approved", "Archived"] and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail=f"Cannot modify alternatives for a decision in status {decision.status}")

    # Create Alternative
    db_alt = models.Alternative(
        decision_id=decision_id,
        title=alt_in.title,
        description=alt_in.description,
        pros=alt_in.pros,
        cons=alt_in.cons,
        cost=alt_in.cost,
        feasibility_rating=alt_in.feasibility_rating,
        risk_rating=alt_in.risk_rating,
        risk_mitigation=alt_in.risk_mitigation
    )
    db.add(db_alt)
    
    # Increment decision version since structural details changed
    decision.current_version += 1
    db_version = models.DecisionVersion(
        decision_id=decision.id,
        version=decision.current_version,
        title=decision.title,
        problem_statement=decision.problem_statement,
        category=decision.category,
        status=decision.status,
        changed_by_id=current_user.id,
        change_summary=f"Added alternative: '{db_alt.title}'"
    )
    db.add(db_version)
    
    db.commit()
    db.refresh(db_alt)
    db.refresh(decision)
    
    auth.log_activity(db, current_user.id, "ALTERNATIVE_CREATE", f"Added alternative '{db_alt.title}' to decision {decision_id}.")
    return db_alt

@router.put("/alternatives/{alternative_id}", response_model=schemas.AlternativeResponse)
def update_alternative(
    alternative_id: int,
    alt_in: schemas.AlternativeUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    alt = db.query(models.Alternative).filter(models.Alternative.id == alternative_id).first()
    if not alt:
        raise HTTPException(status_code=404, detail="Alternative not found.")
        
    decision = db.query(models.Decision).filter(models.Decision.id == alt.decision_id).first()
    if decision.creator_id != current_user.id and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this decision.")

    if decision.status in ["Approved", "Archived"] and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail=f"Cannot modify alternatives for a decision in status {decision.status}")

    # Update Alternative fields conditionally
    if alt_in.title is not None:
        alt.title = alt_in.title
    if alt_in.description is not None:
        alt.description = alt_in.description
    if alt_in.pros is not None:
        alt.pros = alt_in.pros
    if alt_in.cons is not None:
        alt.cons = alt_in.cons
    if alt_in.cost is not None:
        alt.cost = alt_in.cost
    if alt_in.feasibility_rating is not None:
        alt.feasibility_rating = alt_in.feasibility_rating
    if alt_in.risk_rating is not None:
        alt.risk_rating = alt_in.risk_rating
    if alt_in.risk_mitigation is not None:
        alt.risk_mitigation = alt_in.risk_mitigation

    # Increment decision version
    decision.current_version += 1
    db_version = models.DecisionVersion(
        decision_id=decision.id,
        version=decision.current_version,
        title=decision.title,
        problem_statement=decision.problem_statement,
        category=decision.category,
        status=decision.status,
        changed_by_id=current_user.id,
        change_summary=f"Updated alternative: '{alt.title}'"
    )
    db.add(db_version)

    db.commit()
    db.refresh(alt)
    db.refresh(decision)

    auth.log_activity(db, current_user.id, "ALTERNATIVE_UPDATE", f"Updated alternative '{alt.title}' (ID: {alternative_id}).")
    return alt

@router.delete("/alternatives/{alternative_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alternative(
    alternative_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    alt = db.query(models.Alternative).filter(models.Alternative.id == alternative_id).first()
    if not alt:
        raise HTTPException(status_code=404, detail="Alternative not found.")
        
    decision = db.query(models.Decision).filter(models.Decision.id == alt.decision_id).first()
    if decision.creator_id != current_user.id and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail="Not authorized to edit this decision.")

    if decision.status in ["Approved", "Archived"] and current_user.role not in ["Manager", "Administrator"]:
        raise HTTPException(status_code=403, detail=f"Cannot modify alternatives for a decision in status {decision.status}")

    title_deleted = alt.title
    db.delete(alt)
    
    # Increment decision version
    decision.current_version += 1
    db_version = models.DecisionVersion(
        decision_id=decision.id,
        version=decision.current_version,
        title=decision.title,
        problem_statement=decision.problem_statement,
        category=decision.category,
        status=decision.status,
        changed_by_id=current_user.id,
        change_summary=f"Deleted alternative: '{title_deleted}'"
    )
    db.add(db_version)
    
    db.commit()
    db.refresh(decision)

    auth.log_activity(db, current_user.id, "ALTERNATIVE_DELETE", f"Deleted alternative '{title_deleted}' from decision {decision.id}.")
    return
