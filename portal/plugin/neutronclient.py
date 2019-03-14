from neutronclient.v2_0 import client as client
from plugin.base import BaseClient


class NeutronClient(BaseClient):
    def __init__(self, username=None, password=None, project_name=None, token=None, admin=False):
        super().__init__(username, password, project_name, token, admin)
        self.neutron = client.Client(session=self.sess)
        self.network = self.neutron.list_networks()["networks"]

    def list_networks(self):
        network_list = []
        for item in self.network:
            network_keys = {'name'}
            for key, value in item.items():
                if key in network_keys:
                    network_list.append(value)
        network_list.insert(0, "network_list")
        return network_list

    def free_ips(self, ip_net):
        total_ips = self.neutron.show_network_ip_availability(network=ip_net)['network_ip_availability']['total_ips']
        used_ips = self.neutron.show_network_ip_availability(network=ip_net)['network_ip_availability']['used_ips']
        return total_ips-used_ips

    def create_network(self, network_name):
        body_sample = {'network': {'name': network_name,
                                   'admin_state_up': True}}
        net = self.neutron.create_network(body=body_sample)
        body_create_subnet = {'subnets': [{'name': network_name, 'cidr': '192.168.0.0/24',
                                           'ip_version': 4, 'network_id': net['network']['id'],
                                           'gateway_ip': None}]}
        self.neutron.create_subnet(body=body_create_subnet)
        return net['network']['id']
