Copy the systemd service files to make sure the containers start at boot.

    sudo cp services/* /etc/systemd/system
    sudo systemctl enable collision-db.service
    sudo systemctl start collision-db.service
    sudo systemctl enable collision-api.service
    sudo systemctl start collision-api.service

Then restart nginx

    docker exec collision-api sv nginx restart

To enable automated backups

    sudo systemctl enable collision-db-backup.timer
    sudo systemctl start collision-db-backup.timer


