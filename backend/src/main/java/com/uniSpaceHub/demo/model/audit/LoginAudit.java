package com.uniSpaceHub.demo.model.audit;

import com.uniSpaceHub.demo.model.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_audit")
@Data
@NoArgsConstructor
public class LoginAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime loginTime;

    private String method;

    public LoginAudit(User user, LocalDateTime loginTime, String method) {
        this.user = user;
        this.loginTime = loginTime;
        this.method = method;
    }
}
