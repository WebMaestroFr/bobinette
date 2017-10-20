'''Network'''

from wifi import Cell, Scheme
from wifi.exceptions import ConnectionError as WifiConnectionError

print('=> SERVER NETWORK')


class Network(object):
    '''Safe Lock Controller'''
    interface = 'wlan0'

    @classmethod
    def scan(cls):
        '''Scan and List Wifi Networks'''
        networks = Cell.all(cls.interface)
        return list(networks)

    @classmethod
    def find(cls, ssid):
        '''Find Network by SSID'''
        cells = cls.scan()

        for cell in cells:
            if cell.ssid == ssid:
                return cell

        return None

    @classmethod
    def add(cls, cell, psk=None):
        '''Save Network'''
        scheme = Scheme.for_cell(cls.interface, cell.ssid, cell, psk)
        scheme.save()
        return scheme

    @classmethod
    def load(cls, ssid):
        '''Load Saved Network'''
        cell = Scheme.find(cls.interface, ssid)

        if cell:
            return cell

        return None

    @classmethod
    def delete(cls, ssid):
        '''Delete Saved Network'''
        cell = cls.load(ssid)

        if cell:
            cell.delete()
            return True

        return False

    @classmethod
    def connect(cls, ssid, psk=None):
        '''Connect to Network by SSID'''
        cell = cls.find(ssid)

        if cell:
            scheme = cls.load(cell.ssid)

            if scheme:
                scheme.activate()
                return cell

            if cell.encrypted:

                if psk:
                    scheme = cls.add(cell, psk)

                    try:
                        scheme.activate()
                        return cell
                    except WifiConnectionError:
                        cls.delete(ssid)

                return None

            scheme = cls.add(cell)

            try:
                scheme.activate()
                return cell
            except WifiConnectionError:
                cls.delete(ssid)

        return None
