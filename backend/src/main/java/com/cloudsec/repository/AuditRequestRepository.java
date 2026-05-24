package com.cloudsec.repository;

import com.cloudsec.entity.AuditRequest;
import com.cloudsec.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditRequestRepository extends JpaRepository<AuditRequest, Long> {
    List<AuditRequest> findByRequestedByOrderByRequestedAtDesc(User user);
    List<AuditRequest> findByStatusOrderByRequestedAtDesc(AuditRequest.AuditStatus status);
    List<AuditRequest> findAllByOrderByRequestedAtDesc();
}
