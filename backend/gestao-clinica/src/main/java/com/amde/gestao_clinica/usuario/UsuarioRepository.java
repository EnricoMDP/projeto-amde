package com.amde.gestao_clinica.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    // Buscar por nível de acesso
    List<Usuario> findByNivelAcesso(NivelAcesso nivelAcesso);
    
    // Verificar se CPF já existe
    Optional<Usuario> findByCpf(String cpf);
    
    boolean existsByCpf(String cpf);
}
