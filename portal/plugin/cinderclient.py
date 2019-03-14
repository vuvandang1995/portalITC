from cinderclient import client as client_cinder
from plugin.base import BaseClient


class CinderClient(BaseClient):
    def __init__(self, username=None, password=None, project_name=None, token=None, admin=False):
        super().__init__(username, password, project_name, token, admin)
        self.cinder = client_cinder.Client(3, session=self.sess)
