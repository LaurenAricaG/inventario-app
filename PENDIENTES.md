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

#

ver que los botones de exportar e imprimi se vean bien en responsive
y los card esten bien en responsive

dentro de los modulos que tienen cards ver que en todo momento no se rompa la UI

-Ahora arreglar los loading para que salga el breadcum

ELIMINAR codigo que no se esta utilizando

TODAS LAS TRADUCCIONES QUE ESTEN EN UN SOLO LUGAR
const itemStatusTranslations: Record<string, string> = {
PENDING: "Pendiente",
RECEIVED: "Recibido",
MISSING: "Faltante",
SUBSTITUTED: "Sustituido",
};



const companyStyles: Record<string, string> = {
  ESIKA: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300",
  BELCORP: "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-300",
  AVON: "bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-950/20 dark:border-pink-900/50 dark:text-pink-300",
  NATURA: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/20 dark:border-orange-900/50 dark:text-orange-300",
  UNIQUE: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-300",
};

// Configuración de estilos para Marcas
const brandStyles: Record<string, string> = {
  ESIKA: "bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-300",
  CYZONE: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700 dark:bg-fuchsia-950/20 dark:border-fuchsia-900/50 dark:text-fuchsia-300",
  LBEL: "bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-950/20 dark:border-sky-900/50 dark:text-sky-300",
  AVON: "bg-pink-50 border-pink-100 text-pink-700 dark:bg-pink-950/20 dark:border-pink-900/30 dark:text-pink-300",
  UNIQUE: "bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300",
  NATURA: "bg-orange-50 border-orange-100 text-orange-700 dark:bg-orange-950/20 dark:border-orange-900/30 dark:text-orange-300",
};
