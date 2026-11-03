export function validarNovaSenha({ novaSenha, confirmarSenha }) {
  if (novaSenha.length < 8) throw new Error("A nova senha precisa ter pelo menos 8 caracteres.");
  if (novaSenha !== confirmarSenha) throw new Error("A confirmação não corresponde à nova senha.");
}
