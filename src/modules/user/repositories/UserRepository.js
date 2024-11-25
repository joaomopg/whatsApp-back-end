import { pool } from "../../../mysql.js";
import { v4 as uuidv4 } from "uuid";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";

const { sign, verify } = jwt;

class UserRepository {
    create(request, response){
        const { name, password, profilePicture } = request.body;
        pool.getConnection((err, connection)=> {
            if(err){
                return response.status(500).json({message: 'Erro no servidor'})
            }

            hash(password, 10, (error, hash)=> {
                if(error){
                    return response.status(500).json({message: 'Erro no servidor (bcrypt)'})
                }
                
                connection.query(
                    'INSERT INTO users (user_id, name, password, profile_picture) VALUES (?,?,?,?)',
                    [uuidv4(), name, hash, profilePicture],
                    (error, results, fields)=> {
                        connection.release();
                        if (error){
                            return response.status(500).json({message: 'Erro no servidor (banco de dados)'})
                        }

                        return response.status(200).json({message: 'Usuário cadastrado com sucesso'})
                    }
    
                )
            })
        }) 
    }

    login (request, response){
        const { name, password } = request.body;
        pool.getConnection((error, connection)=> {
            if(error){
                return response.status(500).json({message: 'Erro no servidor'})
            }
            connection.query(
                'SELECT * FROM users WHERE name = ?',
                [ name ],
                (err, results, fields)=> {
                    connection.release()
                    if(err){
                        return response.status(500).json({message: 'Erro no servidor'})
                    }
                    compare(password, results[0].password, (error, result)=> {
                        if(error){
                            return response.status(500).json({message: 'Senha incorreta'})
                        }
                        if(result){
                            const token = sign({
                                id: results[0].user_id,
                                name: results[0].name,
                                profile_picture: results[0].profile_picture
                            }, 'segredo', {expiresIn: '1d'});

                            response.status(200).json({token: token, message: 'Token criado com sucesso'});
                        }
                    })
                }
            )
        })
    }

    getUser(request, response){
        const decode = verify(request.headers.authorization, 'segredo');
        if(decode.name){
            pool.getConnection((error, connection)=> {
                if(error){
                    response.status(500).json({message: 'Erro no servidor'})
                }
                connection.query(
                    'SELECT * FROM users WHERE name = ?',
                    [ decode.name ],
                    (err, results, fields)=> {
                        connection.release();
                        if(err){
                            response.status(400).json({message: 'Erro no servidor'})
                        }

                        return response.status(200).send({
                            user: {
                                user_id: results[0].user_id,
                                name: results[0].name,
                                profile_picture: results[0].profile_picture
                            }
                        })
                    }
                )
            })
        }
    }
}

export {UserRepository};