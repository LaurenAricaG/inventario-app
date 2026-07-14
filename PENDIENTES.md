# ENTRADA:

### PURCHASE -> compra (ingreso de mercaderia o un cliente no quiere un producto de una campaña).

### RETURN -> devolucion de cliente (cuando se devuelve un producto despues de haber hecho la venta)

### LOAN -> devolción de un producto a otra consultora

### GIFT -> Le regalaron un producto o gano en un sorteo

### AJUSMENT -> ajuste de stock

# SALIDA:

### LOAN -> prestamos de un producto a otra consultora

### PERSONAL_USE -> uso personal

### LOSS_OR_DAMAGE -> perdida o daños

### GIFT -> Regolo a un cliente o familia

### AJUSMENT -> ajuste de stock

## PARA BITACORA

si bien en cierto que en la bitacora se guarda return, gift pero no se entiendo que se guarde eso más el label
aparte el producto se nececita su codigo para poder identificarlo


ver que los botones de exportar e imprimi se vean bien en responsive
y los card esten bien en responsive

ver que todos los modulos esten en responsive

dentro de los modulos que tienen cards ver que en todo momento no se rompa la UI

- Agregar un breadcrumb en la ruta de admin



Agregar un titulo como componente porque en todos los modulo tiene un titulo un subtitulo entonces puede ser un componentes
que además tenga en la parte de arriba una ruta como
admin->usuarios
admin->roles
admin->categorias
admin->marca
admin->ventas
admin->ventas->nueva venta

    admin->pedidos
        admin->pedidos->registrar pedidos
        admin->pedidos->verificar pedidos
        admin->pedidos->empacas pedidos
        admin->pedidos->entregar pedidos

    Ejemplo:

    [ruta]
    Titulo                                [BOTON DE CREAR]
    sub titulo

ELIMINAR codigo que no se esta utilizando
