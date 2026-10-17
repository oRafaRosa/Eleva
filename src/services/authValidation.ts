export function validateCredentials(email: string, password?: string) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
    throw new Error("Preencha um e-mail válido.");
  if (password !== undefined && !password)
    throw new Error("Preencha sua senha.");
  return normalized;
}
export function validateNewPassword(password: string, confirmation: string) {
  if (password.length < 10)
    throw new Error("Crie uma senha com pelo menos 10 caracteres.");
  if (password !== confirmation) throw new Error("As senhas não são iguais.");
}
export function authError(error: { code?: string; message?: string }) {
  if (error.code === "email_not_confirmed")
    return "Confirme seu e-mail antes de entrar. Confira também a caixa de spam.";
  if (
    error.code === "over_email_send_rate_limit" ||
    error.code === "over_request_rate_limit"
  )
    return "Aguarde alguns minutos antes de tentar novamente.";
  if (error.code === "user_banned")
    return "Esta conta está suspensa. Fale com a equipe ELEVA.";
  if (
    error.code === "email_address_not_authorized" ||
    error.code === "unexpected_failure"
  )
    return "Não foi possível enviar o e-mail. Fale com a equipe ELEVA para verificar o cadastro.";
  if (error.code === "weak_password")
    return "Escolha uma senha mais forte, com letras, números e símbolos.";
  return "Não foi possível concluir. Confira os dados e tente novamente.";
}
