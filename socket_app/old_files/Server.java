import java.io.IOException;
import java.net.ServerSocket;
import java.security.NoSuchAlgorithmException;
import java.net.Socket;

public class Server {
    public static void main(String[] args) throws IOException, NoSuchAlgorithmException{
        ServerSocket server = new ServerSocket(80);
        try{
            System.out.println("Server has started on 127.0.0.1:80.\r\nWaiting for a connection…");
            Socket client = server.accept();
            System.out.println("A client connected");
        } finally {
            server.close();
        }
    }
}