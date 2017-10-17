'''Network'''

import wifi

print('=> SERVER NETWORK')

INTERFACE = 'wlan0'


def scan():
    '''Scan and List Wifi Networks'''
    return wifi.Cell.all(INTERFACE)


def _find(ssid):
    '''Find Network by SSID'''
    cells = scan()

    for cell in cells:
        if cell.ssid == ssid:
            return cell

    return False


def _add(cell, password=None):
    '''Save Network'''
    scheme = wifi.Scheme.for_cell(INTERFACE, cell.ssid, cell, password)
    scheme.save()
    return scheme


def _load(ssid):
    '''Load Saved Network'''
    cell = wifi.Scheme.find(INTERFACE, ssid)

    if cell:
        return cell

    return False


def _delete(ssid):
    '''Delete Saved Network'''
    cell = _load(ssid)

    if cell:
        cell.delete()
        return True

    return False


def connect(ssid, password=None):
    '''Connect to Network by SSID'''
    cell = _find(ssid)

    if cell:
        scheme = _load(cell.ssid)

        if scheme:
            scheme.activate()
            return cell

        if cell.encrypted:

            if password:
                scheme = _add(cell, password)

                try:
                    scheme.activate()
                    return cell
                except wifi.exceptions.ConnectionError:
                    _delete(ssid)

            return False

        scheme = _add(cell)

        try:
            scheme.activate()
            return cell
        except wifi.exceptions.ConnectionError:
            _delete(ssid)

    return False
