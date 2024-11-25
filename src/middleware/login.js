import jwt from "jsonwebtoken"

const { verify } = jwt

const login = (req, res, next) => {
    try {
        const decode = verify(req.headers.authorization, 'segredo');
        req.user = decode;
        next();
    } catch (error) {
        return res.status(401).json({message: "Autenticação necessária"})
    }
}

export { login }