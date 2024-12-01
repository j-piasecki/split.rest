This requires a `.pgpass` file in the home directory of the user running the command. Format of the file is:

```
hostname:port:database:username:password
```

It also needs correct permissions (0600):

```
chmod 600 ~/.pgpass
```
