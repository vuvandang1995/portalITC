from novaclient import client
from neutronclient.v2_0 import client as client_neutron
from cinderclient import client as client_cinder
from glanceclient import Client

from log.log import logger
from plugin.base import BaseClient


class NovaClient(BaseClient):
    def __init__(self, username=None, password=None, project_name=None, token=None, admin=False):
        super().__init__(username, password, project_name, token, admin)
        self.nova = client.Client(2, session=self.sess)
        self.neutron = client_neutron.Client(session=self.sess)
        self.cinder = client_cinder.Client(3, session=self.sess)
        self.glance = Client(2, session=self.sess)
        try:
            self.services = self.nova.services.list()
            self.hypervisors = self.nova.hypervisors.list()
        except Exception as e:
            logger.warning(e)

    def list_server(self):
        return self.nova.servers.list()

    def get_server(self, serverid):
        return self.nova.servers.get(serverid)

    def list_hypervisor(self):
        return self.hypervisors

    def find_hypervisor(self, hypervisor):
        return self.nova.hypervisors.get(hypervisor)

    def list_images(self):
        image_list = []
        for image in self.nova.glance.list():
            image_list.append(image.name)
        return image_list

    def list_Images(self):
        return self.glance.images.list()

    def list_flavor(self):
        fl = self.nova.flavors.list()
        flavor_list = []
        for flavor in fl:
            combo = [flavor.ram, flavor.vcpus, flavor.disk]
            flavor_list.append(combo)
        return flavor_list

    def create_flavor(self, svname, ram, vcpus, disk):
        self.nova.flavors.create(svname, ram, vcpus, disk, flavorid='auto', ephemeral=0, swap=0, rxtx_factor=1.0,
                                 is_public=True, description=None)

    def createVM(self, svname, flavor, image, network_id, max_count, volume_id, private_network, userdata=None,
                 key_name=None):
        if private_network == "0":
            return self.nova.servers.create(svname, flavor=flavor, image=image, nics=[{'net-id': network_id}],
                                            block_device_mapping={'vda': volume_id}, userdata=userdata,
                                            key_name=key_name, max_count=max_count)
        else:
            id_private_net = self.nova.neutron.find_network('private_network_1').id
            return self.nova.servers.create(svname, flavor=flavor, image=image,
                                            nics=[{'net-id': network_id}, {'net-id': id_private_net}],
                                            block_device_mapping={'vda': volume_id}, userdata=userdata,
                                            key_name=key_name, max_count=max_count)

    def createFlavor(self, svname, ram, vcpus, disk):
        return self.nova.flavors.create(svname, ram, vcpus, disk, flavorid='auto', ephemeral=0, swap=0, rxtx_factor=1.0,
                                        is_public=True, description=None)

    def create_sshkey(self, sshkeyname):
        return self.nova.keypairs.create(name=sshkeyname)

    def delete_sshkey(self, sshkeyname):
        self.nova.keypairs.delete(key=sshkeyname)

    def delete_snapshot(self, snapshot_id):
        self.glance.images.delete(snapshot_id)

    def deleteFlavor(self, i_d):
        self.nova.flavors.delete(i_d)

    def create_volume(self, name, size, volume_type=None, imageRef=None, snapshot_id=None):
        return self.cinder.volumes.create(size=size, name=name, imageRef=imageRef, snapshot_id=snapshot_id,
                                          volume_type=volume_type)

    def delete_volume(self, volume):
        return self.cinder.volumes.delete(volume=volume)

    def delete_vm(self, svid):
        self.nova.servers.delete(svid)

    def start_vm(self, svid):
        self.nova.servers.start(svid)

    def reboot_vm(self, svid):
        self.nova.servers.reboot(svid, reboot_type='SOFT')

    def reboot_vm_hard(self, svid):
        self.nova.servers.reboot(svid, reboot_type='HARD')

    def stop_vm(self, svid):
        self.nova.servers.stop(svid)

    def rebuild(self, svid, image, disk_config):
        self.nova.servers.rebuild(svid, image=image, disk_config=disk_config)

    def snapshot_vm(self, svid, snapshotname):
        return self.nova.servers.create_image(svid, image_name=snapshotname)

    def resetpass(self, svid, newpass):
        self.nova.servers.change_password(svid, password=newpass)

    def backup_vm(self, svid, backup_name, backup_type, rotation):
        self.nova.servers.backup(svid, backup_name=backup_name, backup_type=backup_type, rotation=rotation)

    def find_flavor(self, ram=None, vcpus=None, disk=None, id=None):
        if id is None:
            return self.nova.flavors.find(ram=ram, vcpus=vcpus, disk=disk)
        else:
            return self.nova.flavors.find(id=id)

    def find_image(self, image):
        return self.nova.glance.find_image(image)

    def check_volume(self, id):
        return self.cinder.volumes.find(id=id)

    def find_network(self, network):
        return self.nova.neutron.find_network(network).id

    def list_networks(self):
        network_list = []
        for item in self.neutron.list_networks()["networks"]:
            network_keys = {'name'}
            for key, value in item.items():
                if key in network_keys:
                    network_list.append(value)
        network_list.insert(0, "network_list")
        return network_list

    def list_sshkey(self):
        sshkey_list = []
        for item in self.nova.keypairs.list():
            sshkey_list.append(item.name)
        return sshkey_list
