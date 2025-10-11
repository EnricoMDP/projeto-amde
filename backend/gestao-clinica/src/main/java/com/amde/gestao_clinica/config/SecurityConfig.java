package com.amde.gestao_clinica.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private static final String ROLE_ADMIN = "ADMINISTRADOR";
    private static final String ROLE_MEDICO = "MEDICO";

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                .requestMatchers("/api/usuarios/register", "/api/usuarios/login").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole(ROLE_ADMIN)
                    .requestMatchers(HttpMethod.GET, "/api/usuarios/pacientes").hasAnyRole(ROLE_ADMIN, ROLE_MEDICO)
                    .requestMatchers(HttpMethod.GET, "/api/usuarios/*/perfil").hasAnyRole(ROLE_ADMIN, ROLE_MEDICO)
                .requestMatchers(HttpMethod.PUT, "/api/usuarios/**").hasRole(ROLE_ADMIN)
                .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole(ROLE_ADMIN)
                .requestMatchers(HttpMethod.POST, "/api/prontuarios/upload").hasAnyRole(ROLE_ADMIN, ROLE_MEDICO)
                .requestMatchers(HttpMethod.GET, "/api/prontuarios/*/download").hasAnyRole(ROLE_ADMIN, ROLE_MEDICO)
                .requestMatchers(HttpMethod.DELETE, "/api/prontuarios/*").hasAnyRole(ROLE_ADMIN, ROLE_MEDICO)
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    // Permite Vite (http) e mkcert (https) em localhost
    config.setAllowedOriginPatterns(List.of("http://localhost:*", "https://localhost:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}