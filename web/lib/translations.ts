export const translateError = (errorMsg: string): string => {
    if (!errorMsg) return 'Ocorreu um erro desconhecido. Tente novamente.';

    const lowerCaseMsg = errorMsg.toLowerCase();

    const translations: Record<string, string> = {
        'error: email is already in use!': 'Este e-mail já está em uso.',
        'invalid verification token': 'Token de verificação inválido.',
        'verification token has expired': 'O token de verificação expirou.',
        'no account found with that email': 'Nenhuma conta encontrada com este e-mail.',
        'invalid reset token': 'Token de redefinição inválido.',
        'reset token has expired': 'O token de redefinição expirou.',
        'incorrect current password': 'Senha atual incorreta.',
        'bad credentials': 'E-mail ou senha incorretos.',
        'user is disabled': 'Por favor, verifique seu e-mail antes de entrar.'
    };

    // Check exact matches first
    for (const [key, value] of Object.entries(translations)) {
        if (lowerCaseMsg.includes(key)) {
            return value;
        }
    }

    // Fallback if no translation exists
    return errorMsg;
};
