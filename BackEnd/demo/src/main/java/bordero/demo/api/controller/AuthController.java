package bordero.demo.api.controller;

import bordero.demo.api.dto.AuthRequestDto;
import bordero.demo.api.dto.AuthResponseDto;
import bordero.demo.config.JwtUtil;
import bordero.demo.domain.entity.User;
import bordero.demo.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = {
        "http://localhost:3000",
        "https://fidcijj.vercel.app",
        "https://fidcijj-front.onrender.com"
})
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // 👉 Suporte à requisição OPTIONS no /login
    @RequestMapping(value = "/login", method = RequestMethod.OPTIONS)
public ResponseEntity<?> handleLoginOptions() {
    return ResponseEntity
        .ok()
        .header("Access-Control-Allow-Origin", "https://fidcijj-front.onrender.com")
        .header("Access-Control-Allow-Methods", "POST, OPTIONS")
        .header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        .header("Access-Control-Allow-Credentials", "true")
        .build();
}

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequestDto authRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciais inválidas");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Ocorreu um erro durante a autenticação");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponseDto(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<?> saveUser(@RequestBody AuthRequestDto userDto) throws Exception {
        if (userRepository.findByUsername(userDto.getUsername()).isPresent() || userRepository.findByEmail(userDto.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Nome de usuário ou e-mail já existe.");
        }
        User newUser = new User(userDto.getUsername(), passwordEncoder.encode(userDto.getPassword()), "ROLE_USER");
        newUser.setEmail(userDto.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(userRepository.save(newUser));
    }
}