package com.amde.gestao_clinica.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Arrays;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private static final String ROLE_ADMIN = "ADMINISTRADOR";
    private static final String ROLE_MEDICO = "MEDICO";

    // Injeta o valor da propriedade do application.yml
    @Value("${app.cors.allowed-origins:}")
    private String[] allowedOrigins;

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
                // Usa o bean corsConfigurationSource() definido abaixo
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/logout").authenticated()
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
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // LISTA DE ORIGENS PERMITIDAS (O Segredo do Sucesso)
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",                    // Seu ambiente local
            "https://amdesorocaba.com.br",              // Domínio Principal
            "https://www.amdesorocaba.com.br",          // Domínio com WWW
            "https://dtzu1m0v2dkwx.cloudfront.net"     // URL direta do CloudFront
        ));
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}