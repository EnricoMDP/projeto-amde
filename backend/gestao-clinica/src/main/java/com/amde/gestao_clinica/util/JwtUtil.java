package com.amde.gestao_clinica.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.expiration:3600000}")
    private long EXPIRATION;

    // Novo: gerar token com role e uid
    public String generateToken(Long userId, String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("uid", userId);
        return createToken(claims, email);
    }

    // Overload: incluir nome completo no token
    public String generateToken(Long userId, String email, String role, String name) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("uid", userId);
        if (name != null && !name.isBlank()) {
            claims.put("name", name);
        }
        return createToken(claims, email);
    }

    // Mantém compatibilidade com quem chama só com email
    public String generateToken(String email) {
        return createToken(new HashMap<>(), email);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Novo: extrair role do token
    public String extractRole(String token) {
        return extractClaim(token, c -> (String) c.get("role"));
    }

    // Novo: extrair uid do token
    public Long extractUserId(String token) {
        Object uid = extractClaim(token, c -> c.get("uid"));
        return (uid instanceof Number) ? ((Number) uid).longValue() : null;
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token).getBody();
    }

    private String createToken(Map<String, Object> claims, String subject) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public boolean validateToken(String token, String username) {
        final String extracted = extractUsername(token);
        return (extracted != null && extracted.equals(username) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.before(new Date());
    }
}