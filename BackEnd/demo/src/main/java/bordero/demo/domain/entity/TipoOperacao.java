package bordero.demo.domain.entity;

public enum TipoOperacao {
    A_VISTA("A VISTA"),
    IJJ("IJJ"),
    IJJ_TRANSREC("IJJ TRANSREC");

    private String descricao;

    TipoOperacao(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
    
}
