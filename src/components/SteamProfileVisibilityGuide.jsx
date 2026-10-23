export default function SteamProfileVisibilityGuide({ open = false, compact = false }) {
  return (
    <details className={`dg-steam-privacy-guide ${compact ? 'dg-steam-privacy-guide--compact' : ''}`} open={open}>
      <summary>Antes de conectar: deixe seus dados de jogos públicos</summary>
      <div className="dg-steam-privacy-guide-content">
        <p>O GamePulse precisa ler sua biblioteca, horas jogadas e jogos recentes. Sua senha nunca é compartilhada com a DropGames.</p>
        <ol>
          <li>Abra a Steam e acesse <strong>Perfil → Editar perfil</strong>.</li>
          <li>Entre em <strong>Configurações de privacidade</strong>.</li>
          <li>Defina <strong>Meu perfil</strong> como <strong>Público</strong>.</li>
          <li>Defina <strong>Detalhes de jogos</strong> como <strong>Público</strong>.</li>
          <li>Desmarque a opção que mantém o <strong>tempo total de jogo sempre privado</strong>.</li>
          <li>Salve, volte à DropGames e conecte sua conta Steam.</li>
        </ol>
        <a href="https://steamcommunity.com/my/edit/settings" target="_blank" rel="noreferrer">Abrir privacidade do perfil na Steam</a>
        <small>Depois que o GamePulse carregar seus dados, você pode alterar essa configuração novamente quando quiser.</small>
      </div>
    </details>
  );
}
