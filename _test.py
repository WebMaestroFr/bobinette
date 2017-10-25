'''Pytest'''


def test_opencv_3():
    '''OpenCV Version 3'''
    # pylint: disable=E1101
    import cv2
    assert cv2.__version__.startswith('3.')


def test_db_create_all():
    '''Database Creation'''
    from bobinette.__main__ import app, db
    with app.app_context():
        db.create_all()
        assert True


def test_socket_server():
    '''SocketIO Server'''
    from bobinette.__main__ import app, socket
    client = socket.test_client(app)
    received = client.get_received()
    assert len(received) == 1
    assert 'type' in received[0]['args']
    assert received[0]['args']['type'] == 'SET_LABELS'
    client.disconnect()
