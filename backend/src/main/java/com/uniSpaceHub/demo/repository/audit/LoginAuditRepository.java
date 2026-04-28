package com.uniSpaceHub.demo.repository.audit;

import com.uniSpaceHub.demo.model.audit.LoginAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoginAuditRepository extends JpaRepository<LoginAudit, Long> {
    List<LoginAudit> findTop50ByOrderByLoginTimeDesc();
}
