require 'em-websocket'
require 'directory_watcher'

# Chrome sometimes sends HTTP/1.0 requests in violation of WebSockets spec
EventMachine::WebSocket::HandlerFactory::PATH = /^(\w+) (\/[^\s]*) HTTP\/1\.[01]$/

module LiveReload
  VERSION = "1.2"

  def self.start_watching ws
    $dw.add_observer { |*args|
      args.each { |event|
        if event[:type] == :modified
          name = File.basename(event[:path]) 
          puts "Modified: #{name}"
          ws.send name
        end
      }
    }
    $dw.start
  end

  def self.run(host, port, dir, exts)
    EM.kqueue = true if EM.kqueue?
    # Could someone with more knowledge of glob specify that the ".git" directory should not be searched
    $dw = DirectoryWatcher.new dir, :glob => "**/*.{#{exts}}", :scanner => :em

    puts
    puts "Version:    #{VERSION}"
    puts "Port:       #{port}"
    puts "Directory:  #{dir}"
    puts "Extensions: " + exts.split(",").collect {|e| ".#{e}"}.join(" ")
    puts "LiveReload is waiting for browser to connect."
    EventMachine::WebSocket.start(:host => host, :port => port, :debug => false) do |ws|
      ws.onopen    { puts "Browser connected."; ws.send "!!ver:#{VERSION}"; start_watching ws }
      ws.onmessage { |msg| puts "Browser URL: #{msg}" }
      ws.onclose   { puts "Browser disconnected." }
    end
  end
end
