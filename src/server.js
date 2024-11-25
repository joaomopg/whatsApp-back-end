import express from 'express'
import http from 'http'
import { Server } from 'socket.io' 
import { userRoutes } from './routes/user.routes.js';


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = [];

io.on("connection", (socket)=> {
    
    socket.on("join", ({name, currentRoom})=> {
        socket.join(currentRoom);
        console.log(`${name} entrou na sala: ${currentRoom}`);
        // Verificar se o usuário já existe no array (caso contrário, adiciona)
        const existingUser = users.find((user) => user.id === socket.id);
        if (!existingUser) {
            const user = { id: socket.id, name };
            users.push(user);
        }
        io.emit("users", users);
        io.to(currentRoom).emit("join", {message: `O usuário ${name} entrou na sala ${currentRoom}`})
        io.to(currentRoom).emit("message", {name: null, message: `O usuário ${name} entrou.`});
    });

    socket.on("leave", (currentRoom) => {
        if (currentRoom) {
            socket.leave(currentRoom);
            console.log(`Usuário saiu da sala: ${currentRoom}`);
            io.to(currentRoom).emit("leave", {msg: `Usuário ${socket.id} saiu da sala` });
            const index = users.findIndex((user) => user.id === socket.id);
            if (index !== -1) {
                console.log(`Usuário ${users[index].name} desconectou.`);
                users.splice(index, 1);
            }
            // Emitir a lista de usuários atualizada
            io.emit("users", users);
            }
    });
    
    socket.on("message", ({message, name, currentRoom})=> {
        if (currentRoom) {
            const timestamp = new Date().toISOString();
            io.in(currentRoom).emit("message", { message, name, currentRoom, timestamp});
            console.log(`Mensagem ${message} de ${name} enviada para a sala: ${currentRoom}`);
        } else {
            console.log("Erro: Nenhuma sala especificada para o envio da mensagem.");
        }
    })

    socket.on("disconnect", () => {
        // Remover o usuário do array
        const index = users.findIndex((user) => user.id === socket.id);
        if (index !== -1) {
            console.log(`Usuário ${users[index].name} desconectou.`);
            users.splice(index, 1);
        }

        // Emitir a lista de usuários atualizada
        io.emit("users", users);
    });
    
    
})

app.use(express.json());
app.use('/user', userRoutes);

const port = process.env.PORT || 4000;

server.listen(port, () => console.log(`servidor rodando na porta ${port}`))