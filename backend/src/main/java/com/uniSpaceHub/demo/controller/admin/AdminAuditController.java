package com.uniSpaceHub.demo.controller.admin;

import com.uniSpaceHub.demo.model.audit.LoginAudit;
import com.uniSpaceHub.demo.repository.audit.LoginAuditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
public class AdminAuditController {

    private final LoginAuditRepository loginAuditRepository;

    @GetMapping("/logins")
    public ResponseEntity<List<Map<String, Object>>> getRecentLogins() {
        List<LoginAudit> audits = loginAuditRepository.findTop50ByOrderByLoginTimeDesc();
        
        List<Map<String, Object>> response = audits.stream().map(audit -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", audit.getId());
            map.put("userId", audit.getUser().getId());
            map.put("email", audit.getUser().getEmail());
            map.put("name", audit.getUser().getFullName());
            map.put("role", audit.getUser().getRole() != null ? audit.getUser().getRole().getName().name() : null);
            map.put("timestamp", audit.getLoginTime());
            map.put("method", audit.getMethod());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
