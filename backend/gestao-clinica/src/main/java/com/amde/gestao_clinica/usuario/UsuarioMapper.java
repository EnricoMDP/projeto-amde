package com.amde.gestao_clinica.usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    // Mapeia o DTO para a Entidade Usuario
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "paciente", ignore = true)
    @Mapping(target = "senha", ignore = true)
    Usuario toEntity(UsuarioCadastroDTO dto);

    // Mapear Usuario -> UsuarioDTO (mapeia id -> idUsuario)
    @Mapping(source = "id", target = "idUsuario")
    @Mapping(source = "paciente.grauSuporte", target = "grauSuporte")
    @Mapping(source = "funcionario.cargo", target = "cargo")
    @Mapping(source = "funcionario.crm", target = "crm")
    UsuarioDTO toDTO(Usuario usuario);

    // Método auxiliar para mapear os dados do DTO para a Entidade Paciente
    @Mapping(source = "descPaciente", target = "descricao")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    // CORRIGIDO: Nome da variável em minúsculo (registroProntuarios)
    @Mapping(target = "registroProntuarios", ignore = true)
    // REMOVIDO: @Mapping(target = "prontuarioRecente", ignore = true) (Campo não existe mais)
    Paciente toPaciente(UsuarioCadastroDTO dto);
}