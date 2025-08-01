package bordero.demo.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtRequestFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // ==================================================================
        // INÍCIO DO CÓDIGO DE TESTE (SIMULA O LOGIN DO ADMIN)
        // ==================================================================

        // Para cada requisição, criamos um utilizador "admin" com permissão de ADMIN
        UserDetails userDetails = new User("admin", "", Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")));

        // Colocamos este utilizador no contexto de segurança, como se ele tivesse feito login
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // ==================================================================
        // FIM DO CÓDIGO DE TESTE - LEMBRE-SE DE REMOVER ISTO DEPOIS
        // ==================================================================

        chain.doFilter(request, response);
    }
}