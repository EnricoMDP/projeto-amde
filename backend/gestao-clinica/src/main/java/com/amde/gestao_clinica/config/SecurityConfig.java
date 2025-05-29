package com.amde.gestao_clinica.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Adicione este método:
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests()
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs**",
                    "/api/usuarios/login",
                    "/api/usuarios/register"
                ).permitAll()
                .anyRequest().permitAll(); // ou .authenticated() se quiser proteger o resto
        return http.build();
    }
}