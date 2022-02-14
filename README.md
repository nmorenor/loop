# Loop

Loop is a base proyect for a backend application, it can be extended as start for any other projects.

# Background

I've been playing with the Eclipse Theia project and did like what I saw so I did spend some time extracting some code and modifying it to build this project. Right now it just contains an example of what can be done, the browser communicates with the backend via WebSocket and persist the data on the database. Any ideas on improvements are welcome.

# Configuration

I've been running this project with yarn and node 12, to get started run `yarn` on the root of the project, sometimes I get an error, if you get the same just run `yarn` again. Then run `yarn run build`.

I've been using VSCode to work on this project if you do the same just run the existing run configuration. For the database information, look at the app-conf.json file and change that to your needs.

This is the example Screen Shot from the running example.

![Loop](https://nmorenor.com/loop.png)