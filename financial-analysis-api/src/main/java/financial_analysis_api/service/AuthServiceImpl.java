package financial_analysis_api.service;

import financial_analysis_api.domain.Usuario;
import financial_analysis_api.dto.AuthResponseDTO;
import financial_analysis_api.dto.LoginRequestDTO;
import financial_analysis_api.dto.RegistroRequestDTO;
import financial_analysis_api.exception.CredencialesInvalidasException;
import financial_analysis_api.exception.ValidacionException;
import financial_analysis_api.repository.UsuarioRepository;
import financial_analysis_api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Implementacion de AuthService. Registra usuarios con password encriptado
 * y genera JWT en el login tras validar credenciales.
 */
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public AuthResponseDTO registrar(RegistroRequestDTO request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ValidacionException("El email ya esta registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuarioRepository.save(usuario);

        String token = jwtTokenProvider.generarToken(usuario.getEmail());
        return new AuthResponseDTO(token, "Bearer");
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CredencialesInvalidasException("Email o contrasena incorrectos"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new CredencialesInvalidasException("Email o contrasena incorrectos");
        }

        String token = jwtTokenProvider.generarToken(usuario.getEmail());
        return new AuthResponseDTO(token, "Bearer");
    }
}
