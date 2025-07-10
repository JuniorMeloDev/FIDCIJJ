package bordero.demo.domain.repository;

import bordero.demo.domain.entity.TipoOperacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoOperacaoRepository extends JpaRepository<TipoOperacao, Long> {
}