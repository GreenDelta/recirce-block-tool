package de.recirce.block;

import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;
import io.javalin.plugin.bundled.CorsPluginConfig;
import org.eclipse.jetty.server.Connector;
import org.eclipse.jetty.server.HttpConfiguration;
import org.eclipse.jetty.server.HttpConnectionFactory;
import org.eclipse.jetty.server.ServerConnector;

public class Server {

	public static void main(String[] args) {

		// todo: configure port & static dir

		var app = Javalin.create(c -> {
				c.staticFiles.add("static", Location.EXTERNAL);
				c.plugins.enableCors(cors -> cors.add(CorsPluginConfig::anyHost));
				c.jetty.server(() -> {
					var jetty = new org.eclipse.jetty.server.Server();
					var config = new HttpConfiguration();
					config.setRequestHeaderSize(16384);
					config.setResponseHeaderSize(16384);
					var con = new ServerConnector(
						jetty, new HttpConnectionFactory(config));
					con.setPort(8080);
					jetty.setConnectors(new Connector[]{con});
					return jetty;
				});
			})
			.start();


	}
}
