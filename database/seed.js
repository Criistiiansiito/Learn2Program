const sequelize = require('./connection');
const Curso = require('../modelos/Curso');
const Tema = require('../modelos/Tema');
const Test = require('../modelos/Test');
const Logro = require('../modelos/Logros');
const Pregunta = require('../modelos/Pregunta');
const Respuesta = require('../modelos/Respuesta');
const Recordatorio = require('../modelos/Recordatorios');

// Función que puebla la base de datos
async function seedDatabase() {
    try {
        // Si no estamos en la fase de desarrollo poblamos la BD
        const enDesarrollo = (process.env.NODE_ENV || "development") === "development";

        // Sincroniza la BD con el modelo
        await sequelize.sync({ force: enDesarrollo }); // {force: true} borra y crea las tablas de nuevo (en producción no poblamos)
        if (!enDesarrollo)
            return;
        // Crea un curso junto a sus temas, test, preguntas, y respuestas
        await Curso.create({
            
            titulo: "Introducción a la Programación en C++",
            descripcion: "si",
            logro: {
                mensajeMotivacionalCursoOK: '¡Felicidades, has completado el curso con éxito!',
                mensajeMotivacionalCursoKO: 'Lo intentaste, pero no alcanzaste el objetivo, ¡sigue intentándolo!',
                imagen: '/images/logroCurso1.png',
                fechaObtencion: '2025-03-22'
            },
            temas: [
                {
                    titulo: "Tema 1 - Introducción a C++",
                    contenido: "<p>C++ es un lenguaje de programación ampliamente utilizado para desarrollar aplicaciones de sistemas, juegos, software de alto rendimiento, y más. Es un lenguaje de propósito general y fue diseñado por Bjarne Stroustrup en los años 70 como una extensión del lenguaje C. C++ introduce conceptos como la programación orientada a objetos (OOP), manejo de memoria y control de bajo nivel.</p>\n<p>Aunque C++ es un lenguaje complejo y poderoso, es importante entender su sintaxis y los principios básicos que lo componen para comenzar a programar de manera efectiva.</p>\n\n<h3>1.1 - Estructura Básica de un Programa en C++</h3>\n<p>La estructura de un programa en C++ es bastante sencilla y consta de algunos elementos esenciales, como la función principal <code>main()</code>, que es el punto de entrada del programa. A continuación, veremos un ejemplo básico de un programa en C++:</p>\n\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"incluir\">#include</span> <span class=\"libreria\"><iostream></span> <span class=\"comentario\">// Librería estándar para entrada/salida</span>\n<span class=\"palabra_clave\">using</span> <span class=\"palabra_clave\">namespace</span> std; <span class=\"comentario\">// Usamos el espacio de nombres estándar</span>\n\n<span class=\"palabra_clave\">int</span> <span class=\"funcion\">main</span>() { <span class=\"comentario\">// Función principal del programa</span>\n <span class=\"incluir\">cout</span> << <span class=\"cadena\">\"¡Hola, Mundo!\"</span> << <span class=\"funcion\">endl</span>; <span class=\"comentario\">// Imprime \"¡Hola, Mundo!\"</span>\n <span class=\"return\">return</span> <span class=\"numero\">0</span>; <span class=\"comentario\">// Devuelve 0, indicando que el programa terminó correctamente</span>\n}\n</code></pre>\n</div>\n\n<p>En este ejemplo, vemos que:</p>\n<ul>\n <li><code>#include <iostream></code>: Esta línea incluye la librería estándar que permite utilizar las funciones de entrada/salida, como <code>cout</code>.</li>\n <li><code>using namespace std;</code>: Utiliza el espacio de nombres estándar, lo que significa que no es necesario escribir <code>std::</code> antes de las funciones o objetos como <code>cout</code>.</li>\n <li><code>int main()</code>: Define la función principal del programa, desde donde comienza la ejecución.</li>\n <li><code>cout << \"¡Hola, Mundo!\"</code>: Imprime el mensaje en la consola.</li>\n <li><code>return 0;</code>: Indica que el programa terminó con éxito.</li>\n</ul>\n\n<h3>1.2 - Conceptos Clave de C++</h3>\n<p>Antes de profundizar más, es importante familiarizarse con algunos conceptos clave en C++:</p>\n<ul>\n <li><strong>Variables:</strong> Son contenedores de datos. C++ tiene varios tipos de datos, como enteros (<code>int</code>), flotantes (<code>float</code>), y cadenas de texto (<code>string</code>).</li>\n <li><strong>Operadores:</strong> C++ ofrece una gran cantidad de operadores para realizar operaciones matemáticas, lógicas, de comparación y más. Algunos ejemplos son <code>+</code>, <code>-</code>, <code>*</code>, <code><</code>, <code>></code>, etc.</li>\n <li><strong>Condicionales:</strong> C++ permite el uso de condicionales, como <code>if</code>, <code>else</code>, y <code>switch</code>, para ejecutar bloques de código dependiendo de una condición.</li>\n <li><strong>Bucles:</strong> Puedes usar bucles como <code>for</code>, <code>while</code>, y <code>do-while</code> para repetir un bloque de código múltiples veces.</li>\n</ul>\n\n<h3>1.3 - Compilación y Ejecución de un Programa en C++</h3>\n<p>Para ejecutar un programa en C++, primero debes compilarlo utilizando un compilador como <strong>g++</strong> o <strong>clang++</strong>. El proceso de compilación convierte el código fuente en un archivo ejecutable que puede correr en tu máquina.</p>\n\n<p>A continuación, te mostramos cómo compilar un archivo llamado <code>programa.cpp</code> utilizando <code>g++</code> desde la terminal:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"comando\">$ g++ programa.cpp -o programa</span> <span class=\"comando-comentario\">// Compila el archivo y genera el ejecutable</span>\n<span class=\"comando\">$ ./programa</span> <span class=\"comando-comentario\">// Ejecuta el programa compilado</span>\n</code></pre>\n</div>\n\n<p>Recuerda que siempre debes tener un compilador C++ instalado en tu máquina, y la mayoría de las distribuciones modernas de Linux lo incluyen como parte del sistema.</p>\n\n<h3>1.4 - Conclusión</h3>\n<p>La programación en C++ puede parecer intimidante al principio, pero con la práctica, dominarás los conceptos y la sintaxis del lenguaje. A medida que continúes aprendiendo, podrás explorar temas más avanzados como clases y objetos, punteros, manejo de memoria, y la programación orientada a objetos (OOP) en profundidad.</p>\n\n<p>Es recomendable comenzar con proyectos pequeños para poner en práctica lo aprendido y seguir ampliando tus conocimientos con proyectos más grandes y complejos. ¡La clave está en la práctica constante!</p>",
                    id:1
                },
                {
                    titulo: "Tema 2 - Variables",
                    contenido: "<p>En C++, una variable es un espacio en memoria donde se almacena un valor que puede cambiar durante la ejecución del programa. Las variables deben ser declaradas antes de ser utilizadas, especificando su tipo de dato.</p>\n\n<h3>2.1 - Declaración y Asignación de Variables</h3>\n<p>Para declarar una variable en C++, se utiliza la siguiente sintaxis:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">tipo_de_dato</span> nombre_variable;</code></pre>\n</div>\n<p>También es posible inicializar la variable al declararla:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">int</span> edad = <span class=\"numero\">25</span>;</code></pre>\n</div>\n\n<h3>2.2 - Tipos de Datos</h3>\n<p>En C++, las variables pueden ser de diferentes tipos de datos, dependiendo de la información que almacenarán. Los tipos más comunes son:</p>\n<ul>\n <li><code>int</code>: Enteros (números sin decimales). Ejemplo: <code>int numero = 10;</code></li>\n <li><code>float</code>: Números decimales de precisión simple. Ejemplo: <code>float precio = 10.99;</code></li>\n <li><code>double</code>: Números decimales de mayor precisión. Ejemplo: <code>double pi = 3.14159;</code></li>\n <li><code>char</code>: Caracteres individuales. Ejemplo: <code>char letra = \'A\';</code></li>\n <li><code>bool</code>: Valores booleanos (<code>true</code> o <code>false</code>). Ejemplo: <code>bool esActivo = true;</code></li>\n <li><code>string</code> (requiere <code>#include <string></code>): Cadenas de texto. Ejemplo: <code>string nombre = \"Juan\";</code></li>\n</ul>\n\n<h3>2.3 - Modificadores de Tipo</h3>\n<p>En C++, los modificadores alteran la capacidad de almacenamiento y el rango de valores de una variable:</p>\n<ul>\n <li><code>short</code>: Reduce el tamaño de un entero.</li>\n <li><code>long</code>: Aumenta el tamaño de un entero o un decimal.</li>\n <li><code>unsigned</code>: Solo permite valores positivos.</li>\n <li><code>signed</code>: Permite valores positivos y negativos (es el valor por defecto).</li>\n</ul>\n\n<h3>Ejemplo de modificadores:</h3>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">unsigned int</span> cantidad = <span class=\"numero\">100</span>; <span class=\"comentario\">// Solo permite valores positivos</span>\n<span class=\"palabra_clave\">long</span> poblacion = <span class=\"numero\">7500000000</span>; <span class=\"comentario\">// Un número más grande</span></code></pre>\n</div>\n\n<h3>2.4 - Constantes</h3>\n<p>Las constantes son variables cuyo valor no puede cambiar después de ser inicializadas. Se declaran con la palabra clave <code>const</code>:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">const</span> <span class=\"palabra_clave\">double</span> PI = <span class=\"numero\">3.14159</span>;</code></pre>\n</div>\n\n<h3>2.5 - Entrada y Salida de Datos</h3>\n<p>Para leer valores desde el teclado y mostrarlos en la pantalla, se usa <code>cin</code> y <code>cout</code> de la biblioteca <code>iostream</code>:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"incluir\">#include</span> <span class=\"libreria\"><iostream></span> <span class=\"comentario\">// Librería estándar para entrada/salida</span>\n<span class=\"palabra_clave\">using</span> <span class=\"palabra_clave\">namespace</span> std; <span class=\"comentario\">// Espacio de nombres estándar</span>\n\n<span class=\"palabra_clave\">int</span> <span class=\"funcion\">main</span>() {\n <span class=\"palabra_clave\">int</span> edad;\n <span class=\"incluir\">cout</span> << <span class=\"cadena\">\"Ingresa tu edad: \"</span>;\n <span class=\"incluir\">cin</span> >> edad;\n <span class=\"incluir\">cout</span> << <span class=\"cadena\">\"Tu edad es: \"</span> << edad << <span class=\"funcion\">endl</span>;\n <span class=\"return\">return</span> <span class=\"numero\">0</span>;\n}</code></pre>\n</div>\n\n<h3>2.6 - Ámbito de Variables</h3>\n<p>El ámbito de una variable determina dónde puede ser utilizada dentro del código. Existen dos tipos principales:</p>\n<ul>\n <li><strong>Ámbito local:</strong> La variable solo puede ser usada dentro de la función o bloque donde fue declarada.</li>\n <li><strong>Ámbito global:</strong> La variable es declarada fuera de cualquier función y puede ser utilizada en todo el programa.</li>\n</ul>\n\n<h3>Ejemplo:</h3>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">int</span> global = <span class=\"numero\">10</span>; <span class=\"comentario\">// Variable global</span>\n\n<span class=\"palabra_clave\">void</span> funcion() {\n <span class=\"palabra_clave\">int</span> local = <span class=\"numero\">20</span>; <span class=\"comentario\">// Variable local</span>\n <span class=\"incluir\">cout</span> << global << <span class=\"funcion\">endl</span>;\n}\n\n<span class=\"palabra_clave\">int</span> <span class=\"funcion\">main</span>() {\n funcion();\n <span class=\"incluir\">cout</span> << local; <span class=\"comentario\">// ERROR: local no está definida aquí</span>\n <span class=\"return\">return</span> <span class=\"numero\">0</span>;\n}</code></pre>\n</div>\n\n<h3>2.7 - Ejemplo Completo</h3>\n<p>El siguiente programa muestra cómo declarar e imprimir diferentes tipos de variables en C++:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"incluir\">#include</span> <span class=\"libreria\"><iostream></span>\n<span class=\"palabra_clave\">using</span> <span class=\"palabra_clave\">namespace</span> std;\n\n<span class=\"palabra_clave\">int</span> <span class=\"funcion\">main</span>() {\n <span class=\"palabra_clave\">int</span> edad = <span class=\"numero\">25</span>;\n <span class=\"palabra_clave\">double</span> precio = <span class=\"numero\">19.99</span>;\n <span class=\"palabra_clave\">string</span> nombre = <span class=\"cadena\">\"Carlos\"</span>;\n\n <span class=\"incluir\">cout</span> << nombre << <span class=\"funcion\">endl</span>;\n <span class=\"return\">return</span> <span class=\"numero\">0</span>;\n}</code></pre>\n</div>",
                    id:2
                },
                {
                    titulo: "Tema 3 - Funciones",
                    contenido: "<p>Las variables son contenedores de datos que permiten almacenar información para ser utilizada durante la ejecución de un programa. En C++, las variables deben ser declaradas antes de ser utilizadas, y es necesario especificar su tipo de dato. C++ es un lenguaje fuertemente tipado, lo que significa que cada variable debe tener un tipo de dato específico, como <code>int</code> para enteros, <code>float</code> para números decimales, o <code>string</code> para cadenas de texto.</p>\n\n<h3>3.1 - Tipos de Datos</h3>\n<p>C++ ofrece varios tipos de datos primitivos que puedes usar para declarar variables. Los más comunes son:</p>\n<ul>\n <li><code>int</code>: Para enteros, como <code>5</code>, <code>-10</code>.</li>\n <li><code>float</code>: Para números decimales, como <code>3.14</code>, <code>-0.001</code>.</li>\n <li><code>double</code>: Similar a <code>float</code>, pero con mayor precisión.</li>\n <li><code>char</code>: Para caracteres individuales, como <code>\'a\'</code>, <code>\'A\'</code>.</li>\n <li><code>bool</code>: Para valores lógicos, <code>true</code> o <code>false</code>.</li>\n <li><code>string</code>: Para cadenas de texto, como <code>\"Hola Mundo\"</code>.</li>\n</ul>\n\n<h3>3.2 - Declaración y Asignación de Variables</h3>\n<p>En C++, primero debes declarar el tipo de dato de una variable y luego puedes asignarle un valor. Aquí tienes un ejemplo:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">int</span> <span class=\"numero\">edad</span> = <span class=\"numero\">25</span>; <span class=\"comentario\">// Declaración y asignación de un entero</span>\n<span class=\"palabra_clave\">float</span> <span class=\"numero\">pi</span> = <span class=\"numero\">3.14</span>; <span class=\"comentario\">// Declaración y asignación de un número decimal</span>\n<span class=\"palabra_clave\">string</span> <span class=\"cadena\">nombre</span> = <span class=\"cadena\">\"Juan\"</span>; <span class=\"comentario\">// Declaración y asignación de una cadena de texto</span>\n</code></pre>\n</div>\n\n<h3>3.3 - Variables Constantes</h3>\n<p>A veces es necesario declarar variables cuyos valores no cambiarán durante la ejecución del programa. Para esto, puedes usar la palabra clave <code>const</code>, que indica que la variable es constante:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">const</span> <span class=\"palabra_clave\">int</span> <span class=\"numero\">MAX_EDAD</span> = <span class=\"numero\">100</span>; <span class=\"comentario\">// Valor constante</span>\n</code></pre>\n</div>\n\n<h3>3.4 - Ámbito de las Variables</h3>\n<p>El ámbito de una variable se refiere a la parte del programa en la que puede ser utilizada. Las variables locales son aquellas que se declaran dentro de una función o bloque de código, y solo pueden ser utilizadas dentro de ese bloque. Las variables globales, en cambio, se declaran fuera de todas las funciones y pueden ser utilizadas en cualquier parte del programa.</p>\n\n<h3>3.5 - Ejemplo Completo</h3>\n<p>A continuación, se muestra un programa de ejemplo donde se declaran y utilizan varias variables:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"incluir\">#include</span> <span class=\"libreria\"><iostream></span> <span class=\"comentario\">// Librería estándar para entrada/salida</span>\n<span class=\"palabra_clave\">using</span> <span class=\"palabra_clave\">namespace</span> std; <span class=\"comentario\">// Usamos el espacio de nombres estándar</span>\n\n<span class=\"palabra_clave\">int</span> <span class=\"funcion\">main</span>() { \n <span class=\"palabra_clave\">int</span> <span class=\"numero\">edad</span> = <span class=\"numero\">25</span>;\n <span class=\"palabra_clave\">float</span> <span class=\"numero\">altura</span> = <span class=\"numero\">1.75</span>;\n <span class=\"palabra_clave\">string</span> <span class=\"cadena\">nombre</span> = <span class=\"cadena\">\"Juan\"</span>;\n\n <span class=\"incluir\">cout</span> << <span class=\"cadena\">\"Nombre: \"</span> << <span class=\"numero\">nombre</span> << <span class=\"funcion\">endl</span>;\n <span class=\"incluir\">cout</span> << <span class=\"cadena\">\"Edad: \"</span> << <span class=\"numero\">edad</span> << <span class=\"funcion\">endl</span>;\n <span class=\"incluir\">cout</span> << <span class=\"cadena\">\"Altura: \"</span> << <span class=\"numero\">altura</span> << <span class=\"funcion\">endl</span>;\n\n <span class=\"return\">return</span> <span class=\"numero\">0</span>;\n}\n</code></pre>\n</div>\n\n<p>Este programa declara tres variables: <code>edad</code> de tipo <code>int</code>, <code>altura</code> de tipo <code>float</code>, y <code>nombre</code> de tipo <code>string</code>. Luego, imprime los valores de estas variables en la consola.</p>\n\n<h3>3.6 - Conclusión</h3>\n<p>Las variables son fundamentales en cualquier lenguaje de programación, y C++ ofrece una amplia variedad de tipos de datos para trabajar con ellas. Es importante comprender los diferentes tipos de datos y cómo declarar y utilizar variables correctamente, ya que son esenciales para almacenar y manipular la información en un programa.</p>",
                    id:3
                },
                {
                    titulo: "Tema 4 - Arrays",
                    contenido: "<p>Un <strong>array</strong> es una estructura de datos que almacena una colección de elementos del mismo tipo. Los arrays permiten almacenar múltiples valores en una sola variable, lo que facilita la manipulación de datos de manera más eficiente que con variables individuales. En C++, los arrays tienen un tamaño fijo que se define en el momento de su declaración.</p>\n\n<h3>4.1 - Declaración de Arrays</h3>\n<p>Para declarar un array en C++, debes especificar el tipo de los elementos y el tamaño del array. Aquí tienes un ejemplo:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">int</span> <span class=\"numero\">numeros[5]</span>; <span class=\"comentario\">// Declaración de un array de 5 enteros</span></code></pre>\n</div>\n<p>En este ejemplo, se declara un array de 5 elementos del tipo <code>int</code>. El índice del array comienza desde 0, por lo que el array tendrá índices de 0 a 4.</p>\n\n<h3>4.2 - Inicialización de Arrays</h3>\n<p>Al declarar un array, puedes inicializar sus elementos en el mismo momento. Esto se hace colocando los valores entre llaves:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">int</span> <span class=\"numero\">numeros[5]</span> = <span class=\"numero\">{1, 2, 3, 4, 5}</span>; <span class=\"comentario\">// Inicialización de un array</span></code></pre>\n</div>\n<p>En este caso, los elementos del array <code>numeros</code> se inicializan con los valores <code>1</code>, <code>2</code>, <code>3</code>, <code>4</code>, y <code>5</code>.</p>\n\n<h3>4.3 - Acceso a los Elementos de un Array</h3>\n<p>Los elementos de un array se acceden utilizando el índice del array. Recuerda que el índice comienza desde 0. Aquí tienes un ejemplo:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"incluir\">cout</span> << <span class=\"numero\">numeros[0]</span> << <span class=\"funcion\">endl</span>; <span class=\"comentario\">// Imprime el primer elemento del array (1)</span>\n<span class=\"incluir\">cout</span> << <span class=\"numero\">numeros[2]</span> << <span class=\"funcion\">endl</span>; <span class=\"comentario\">// Imprime el tercer elemento del array (3)</span></code></pre>\n</div>\n<p>En este ejemplo, <code>numeros[0]</code> devuelve el primer elemento, que es <code>1</>, y <code>numeros[2]</code> devuelve el tercer elemento, que es <code>3</>.</p>\n\n<h3>4.4 - Arrays Multidimensionales</h3>\n<p>Los arrays pueden ser de más de una dimensión, lo que permite trabajar con tablas o matrices. Aquí tienes un ejemplo de un array bidimensional (matriz):</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">int</span> <span class=\"numero\">matriz[2][3]</span> = <span class=\"numero\">{{1, 2, 3}, {4, 5, 6}}</span>;</code></pre>\n</div>\n<p>Este array tiene 2 filas y 3 columnas, lo que forma una matriz de 2x3. Para acceder a un elemento de la matriz, se especifican dos índices: uno para la fila y otro para la columna:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"incluir\">cout</span> << <span class=\"numero\">matriz[0][1]</span> << <span class=\"funcion\">endl</span>; <span class=\"comentario\">// Imprime el elemento en la primera fila y segunda columna (2)</span></code></pre>\n</div>\n\n<h3>4.5 - Iteración a través de un Array</h3>\n<p>Para recorrer los elementos de un array, se suelen utilizar bucles. Aquí tienes un ejemplo usando un bucle <code>for</code> para imprimir todos los elementos de un array:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">for</span> (<span class=\"palabra_clave\">int</span> <span class=\"numero\">i</span> = <span class=\"numero\">0</span>; <span class=\"numero\">i</span> < <span class=\"numero\">5</span>; <span class=\"numero\">i</span>++) {\n <span class=\"incluir\">cout</span> << <span class=\"numero\">numeros[i]</span> << <span class=\"funcion\">endl</span>;\n}\n</code></pre>\n</div>\n<p>Este código imprimirá todos los elementos del array <code>numeros</code> desde el índice 0 hasta el 4.</p>\n\n<h3>4.6 - Conclusión</h3>\n<p>Los arrays son fundamentales en C++ para manejar colecciones de datos de manera eficiente. Aunque C++ no permite cambiar el tamaño de los arrays una vez que han sido declarados, puedes usar <code>std::vector</code> si necesitas un tamaño dinámico. Los arrays proporcionan una forma rápida y eficiente de almacenar y acceder a grandes cantidades de datos en tu programa.</p>",
                    id:4
                },
                {
                    titulo: "Tema 5 - Punteros",
                    contenido: "<p>En C++, los punteros son una característica poderosa que permite manipular directamente la memoria. Un puntero es una variable que almacena la dirección de memoria de otra variable. Los punteros son útiles para la gestión dinámica de la memoria, pasar grandes estructuras de datos por referencia, y manipular directamente los datos en la memoria. Comprender cómo funcionan los punteros es esencial para un dominio avanzado de C++.</p>\n\n<h3>5.1 - Declaración de un Puntero</h3>\n<p>Para declarar un puntero en C++, se usa el operador asterisco (<code>*</code>) junto con el tipo de dato al que apunta. Por ejemplo:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">int</span>* <span class=\"numero\">ptr</span>; <span class=\"comentario\">// Un puntero a un entero</span></code></pre>\n</div>\n<p>En este ejemplo, <code>ptr</code> es un puntero que puede almacenar la dirección de memoria de una variable de tipo <code>int</code>.</p>\n\n<h3>5.2 - Inicialización de un Puntero</h3>\n<p>Un puntero debe apuntar a una dirección de memoria válida antes de ser utilizado. Para asignarle una dirección, se usa el operador de dirección (<code>&</code>) en una variable. Por ejemplo:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">int</span> <span class=\"numero\">numero</span> = <span class=\"numero\">10</span>;\n<span class=\"palabra_clave\">int</span>* <span class=\"numero\">ptr</span> = <span class=\"direccion\"> &numero</span>; <span class=\"comentario\">// Asigna la dirección de ''numero'' a ptr</span></code></pre>\n</div>\n\n<h3>5.3 - Acceso al Valor de un Puntero</h3>\n<p>Para acceder al valor de la variable a la que apunta un puntero, se usa el operador de desreferenciación (<code>*</code>). Por ejemplo:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"incluir\">cout</span> << <span class=\"cadena\">\"Valor de la variable a la que apunta ptr: \"</span> << <span class=\"numero\">*</span><span class=\"numero\">ptr</span> << <span class=\"funcion\">endl</span>; <span class=\"comentario\">// Imprime el valor de la variable a la que apunta ptr</span></code></pre>\n</div>\n<p>En este caso, <code>*ptr</code> accederá al valor almacenado en la dirección de memoria apuntada por <code>ptr</code>, es decir, el valor de <code>numero</code>.</p>\n\n<h3>5.4 - Punteros y Arreglos</h3>\n<p>En C++, los punteros pueden ser utilizados para recorrer arreglos. De hecho, el nombre de un arreglo es un puntero al primer elemento del arreglo. Puedes utilizar punteros para acceder a los elementos de un arreglo de la siguiente manera:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">int</span> <span class=\"numero\">arr</span>[<span class=\"numero\">3</span>] = {<span class=\"numero\">10</span>, <span class=\"numero\">20</span>, <span class=\"numero\">30</span>};\n<span class=\"palabra_clave\">int</span>* <span class=\"numero\">ptr</span> = <span class=\"direccion\">arr</span>;\n\n<span class=\"incluir\">cout</span> << <span class=\"cadena\">\"Primer elemento: \"</span> << <span class=\"numero\">*ptr</span> << <span class=\"funcion\">endl</span>;\n<span class=\"incluir\">cout</span> << <span class=\"cadena\">\"Segundo elemento: \"</span> << <span class=\"numero\">*(ptr + 1)</span> << <span class=\"funcion\">endl</span>; <span class=\"comentario\">// Accede al segundo elemento</span>\n</code></pre>\n</div>\n<p>En este ejemplo, <code>ptr</code> apunta al primer elemento de <code>arr</code>. El acceso al segundo elemento se realiza con <code>*(ptr + 1)</code>.</p>\n\n<h3>5.5 - Punteros a Punteros</h3>\n<p>En C++, también puedes tener punteros a punteros. Esto se refiere a una variable que almacena la dirección de memoria de otro puntero. La declaración de un puntero a puntero se realiza añadiendo otro asterisco (<code>*</code>) al tipo de puntero:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">int</span> <span class=\"numero\">numero</span> = <span class=\"numero\">10</span>;\n<span class=\"palabra_clave\">int</span>* <span class=\"numero\">ptr</span> = <span class=\"direccion\"> &numero</span>;\n<span class=\"palabra_clave\">int</span>** <span class=\"numero\">pptr</span> = <span class=\"direccion\"> &ptr</span>; <span class=\"comentario\">// Puntero a puntero</span>\n</code></pre>\n</div>\n<p>En este ejemplo, <code>pptr</code> es un puntero a un puntero que apunta a la dirección de <code>ptr</code>.</p>\n\n<h3>5.6 - Ejemplo Completo</h3>\n<p>A continuación, te mostramos un programa que utiliza punteros:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"incluir\">#include</span> <span class=\"libreria\"><iostream></span> <span class=\"comentario\">// Librería estándar para entrada/salida</span>\n<span class=\"palabra_clave\">using</span> <span class=\"palabra_clave\">namespace</span> std; <span class=\"comentario\">// Usamos el espacio de nombres estándar</span>\n\n<span class=\"palabra_clave\">int</span> <span class=\"funcion\">main</span>() {\n <span class=\"palabra_clave\">int</span> <span class=\"numero\">numero</span> = <span class=\"numero\">10</span>;\n <span class=\"palabra_clave\">int</span>* <span class=\"numero\">ptr</span> = <span class=\"direccion\"> &numero</span>;\n\n <span class=\"incluir\">cout</span> << <span class=\"cadena\">\"Valor de numero: \"</span> << <span class=\"numero\">*ptr</span> << <span class=\"funcion\">endl</span>; <span class=\"comentario\">// Imprime el valor de numero a través del puntero</span>\n\n <span class=\"palabra_clave\">int</span> <span class=\"numero\">arr</span>[<span class=\"numero\">3</span>] = {<span class=\"numero\">10</span>, <span class=\"numero\">20</span>, <span class=\"numero\">30</span>};\n <span class=\"palabra_clave\">int</span>* <span class=\"numero\">arrPtr</span> = <span class=\"direccion\">arr</span>;\n\n <span class=\"incluir\">cout</span> << <span class=\"cadena\">\"Primer elemento del arreglo: \"</span> << <span class=\"numero\">*arrPtr</span> << <span class=\"funcion\">endl</span>;\n\n <span class=\"return\">return</span> <span class=\"numero\">0</span>;\n}\n</code></pre>\n</div>\n\n<h3>5.7 - Conclusión</h3>\n<p>Los punteros son una herramienta poderosa en C++ para manipular directamente la memoria. Permiten trabajar con referencias, acceder a la memoria de manera dinámica y gestionar recursos de manera eficiente. Aunque el uso de punteros puede ser complicado al principio, son esenciales para realizar tareas avanzadas de programación en C++.</p>",
                    id:5
                },
                {
                    titulo: "Tema 6 - Introducción a la Recursión",
                    contenido: "<p>La recursión es una técnica de programación en la que una función se llama a sí misma para resolver un problema. Esta técnica es especialmente útil cuando el problema puede ser descompuesto en subproblemas más pequeños que son similares al problema original. Sin embargo, para evitar llamadas infinitas, es fundamental que la función recursiva tenga una condición base que termine las llamadas recursivas.</p>\n\n<h3>6.1 - Funcionamiento de la Recursión</h3>\n<p>En una función recursiva, la función se llama a sí misma, pero con un conjunto de parámetros más pequeños o diferentes en cada llamada. El proceso continúa hasta que se alcanza una condición base, momento en el cual se deja de llamar a la función recursiva y se comienza a regresar el valor hacia atrás.</p>\n\n<h3>6.2 - Ejemplo de Recursión</h3>\n<p>A continuación, se muestra un ejemplo simple de recursión: el cálculo del factorial de un número. El factorial de un número entero positivo <code>n</code> se define como el producto de todos los números enteros desde 1 hasta <code>n</code>. Por ejemplo, el factorial de 5 es <code>5! = 5 * 4 * 3 * 2 * 1</code>.</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"palabra_clave\">int</span> <span class=\"funcion\">factorial</span>(<span class=\"palabra_clave\">int</span> n) {\n <span class=\"palabra_clave\">if</span> (n == <span class=\"numero\">0</span>) {\n <span class=\"return\">return</span> <span class=\"numero\">1</span>; <span class=\"comentario\">// Condición base</span>\n }\n <span class=\"return\">return</span> n * <span class=\"funcion\">factorial</span>(n - <span class=\"numero\">1</span>); <span class=\"comentario\">// Llamada recursiva</span>\n}</code></pre>\n</div>\n<p>En este caso, la función <code>factorial</code> se llama a sí misma, pero con un valor menor cada vez (n-1), hasta que llega a 0, momento en el que devuelve 1 y comienza a regresar el valor hacia atrás.</p>\n\n<h3>6.3 - Llamada Recursiva</h3>\n<p>Una llamada recursiva es una invocación de la función desde sí misma, donde se modifican los parámetros en cada llamada para acercarse a la condición base. Un ejemplo sencillo de cómo funciona la llamada recursiva es el siguiente:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"incluir\">cout</span> << <span class=\"cadena\">\"Factorial de 5: \"</span> << <span class=\"funcion\">factorial</span>(<span class=\"numero\">5</span>) << <span class=\"funcion\">endl</span>;</code></pre>\n</div>\n<p>En este ejemplo, la función recursiva <code>factorial(5)</code> se llama y la llamada se descompone en subproblemas cada vez, hasta que se alcanza el valor base de 0.</p>\n\n<h3>6.4 - Condición Base</h3>\n<p>Una condición base es el caso que termina la recursión. Si no existe una condición base, la recursión continuará indefinidamente y eventualmente causará un desbordamiento de pila. Es fundamental definir correctamente las condiciones base para evitar este problema.</p>\n<p>En el ejemplo anterior, la condición base es cuando <code>n == 0</code>, en cuyo caso la función retorna <code>1</code> y se detiene la recursión.</p>\n\n<h3>6.5 - Ejemplo Completo de Recursión</h3>\n<p>A continuación, se muestra un programa completo que utiliza recursión para calcular el factorial de un número:</p>\n<div class=\"bloque-codigo\">\n <pre><code><span class=\"incluir\">#include</span> <span class=\"libreria\"><iostream></span> <span class=\"comentario\">// Librería estándar para entrada/salida</span>\n<span class=\"palabra_clave\">using</span> <span class=\"palabra_clave\">namespace</span> std; <span class=\"comentario\">// Usamos el espacio de nombres estándar</span>\n\n<span class=\"palabra_clave\">int</span> <span class=\"funcion\">factorial</span>(<span class=\"palabra_clave\">int</span> n) {\n <span class=\"palabra_clave\">if</span> (n == <span class=\"numero\">0</span>) {\n <span class=\"return\">return</span> <span class=\"numero\">1</span>; <span class=\"comentario\">// Condición base</span>\n }\n <span class=\"return\">return</span> n * <span class=\"funcion\">factorial</span>(n - <span class=\"numero\">1</span>); <span class=\"comentario\">// Llamada recursiva</span>\n}\n\n<span class=\"palabra_clave\">int</span> <span class=\"funcion\">main</span>() {\n <span class=\"incluir\">cout</span> << <span class=\"cadena\">\"Factorial de 5: \"</span> << <span class=\"funcion\">factorial</span>(<span class=\"numero\">5</span>) << <span class=\"funcion\">endl</span>;\n <span class=\"return\">return</span> <span class=\"numero\">0</span>;\n}\n</code></pre>\n</div>\n\n<h3>6.6 - Conclusión</h3>\n<p>La recursión es una herramienta muy poderosa en programación, que permite resolver problemas complejos de manera simple y elegante. Aunque puede ser más difícil de entender al principio, es crucial aprender a manejar las condiciones base y las llamadas recursivas para evitar problemas de desbordamiento de pila y otros errores. Al comprender estos conceptos, puedes escribir soluciones recursivas eficientes y efectivas para una variedad de problemas en C++.</p>",
                    id:6
                }
            ],
            test: {
                titulo: "Test C++",
                preguntas: [
                    {
                        numero: 1,
                        enunciado: "¿Cuál es la función principal de la instrucción #include <iostream> en un programa en C++?",
                        retroalimentacion: "La instrucción #include <iostream> se utiliza para incluir la biblioteca estándar de entrada/salida en C++ que permite realizar operaciones como la entrada de datos desde el teclado y la salida de datos hacia la pantalla.",
                        respuestas: [
                            {
                                texto: "Permite definir variables de tipo int y float.",
                                esCorrecta: false
                            },
                            {
                                texto: "Es una directiva que incluye la biblioteca de entrada/salida estándar.",
                                esCorrecta: true
                            },
                            {
                                texto: "Sirve para declarar funciones dentro del programa.",
                                esCorrecta: false
                            },
                            {
                                texto: "Es un comentario especial en el código fuente.",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 2,
                        enunciado: "¿Qué sucede si se omite return 0; en la función main() de un programa en C++?",
                        retroalimentacion: "Aunque no es obligatorio, algunas implementaciones de C++ añaden automáticamente \"return 0;\" al final de la función main(), indicando una terminación exitosa del programa.",
                        respuestas: [
                            {
                                texto: "El programa no se compilará correctamente.",
                                esCorrecta: false
                            },
                            {
                                texto: "Se generará un error en tiempo de ejecución.",
                                esCorrecta: false
                            },
                            {
                                texto: "No es obligatorio, ya que algunas implementaciones lo añaden automáticamente.",
                                esCorrecta: true
                            },
                            {
                                texto: "Se mostrará un mensaje de advertencia y el programa se detendrá.",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 3,
                        enunciado: "¿Cuál de las siguientes afirmaciones sobre C++ es correcta?",
                        retroalimentacion: "C++ es una extensión del lenguaje C que incorpora características de la programación orientada a objetos, permitiendo una mayor modularidad y reutilización del código.",
                        respuestas: [
                            {
                                texto: "Es un lenguaje exclusivamente orientado a objetos.",
                                esCorrecta: false
                            },
                            {
                                texto: "Fue creado en los años 90 como una evolución de Java.",
                                esCorrecta: false
                            },
                            {
                                texto: "Es una extensión del lenguaje C que incorpora programación orientada a objetos.",
                                esCorrecta: true
                            },
                            {
                                texto: "No permite la manipulación directa de memoria.",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 4,
                        enunciado: "¿Cuál es la diferencia entre una variable int y una double en C++?",
                        retroalimentacion: "La principal diferencia es que int almacena números enteros, mientras que double almacena números con decimales, lo cual es útil para representar valores más precisos.",
                        respuestas: [
                            {
                                texto: "int almacena caracteres y double almacena números enteros.",
                                esCorrecta: false
                            },
                            {
                                texto: "int almacena números enteros y double almacena números con decimales.",
                                esCorrecta: true
                            },
                            {
                                texto: "int puede almacenar valores más grandes que double.",
                                esCorrecta: false
                            },
                            {
                                texto: "double solo puede almacenar valores positivos.",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 5,
                        enunciado: "¿Qué ocurre si intentas acceder a una variable local fuera de la función donde fue declarada?",
                        retroalimentacion: "Las variables locales solo son accesibles dentro de la función en la que se declaran, por lo que intentar acceder fuera de su ámbito generará un error de compilación.",
                        respuestas: [
                            {
                                texto: "Se generará un error de compilación.",
                                esCorrecta: true
                            },
                            {
                                texto: "La variable tomará automáticamente un valor por defecto.",
                                esCorrecta: false
                            },
                            {
                                texto: "La variable se convertirá en global.",
                                esCorrecta: false
                            },
                            {
                                texto: "No ocurre nada, simplemente no se imprimirá su valor.",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 6,
                        enunciado: "¿Cuál de las siguientes declaraciones es incorrecta en C++?",
                        retroalimentacion: "Una declaración incorrecta sería \"unsigned int edad = -25;\" ya que los valores negativos no son válidos para una variable de tipo unsigned int.",
                        respuestas: [
                            {
                                texto: "const double PI = 3.14159;",
                                esCorrecta: false
                            },
                            {
                                texto: "unsigned int edad = -25;",
                                esCorrecta: true
                            },
                            {
                                texto: "char letra = 'A';",
                                esCorrecta: false
                            },
                            {
                                texto: "string nombre = \"Juan\";",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 7,
                        enunciado: "¿Cuál de las siguientes afirmaciones sobre funciones en C++ es correcta?",
                        retroalimentacion: "Las funciones pueden ser declaradas y definidas en diferentes archivos, lo que permite una organización más clara y modular del código.",
                        respuestas: [
                            {
                                texto: "Una función en C++ siempre debe devolver un valor.",
                                esCorrecta: false
                            },
                            {
                                texto: "Las funciones pueden ser declaradas y definidas en diferentes archivos.",
                                esCorrecta: true
                            },
                            {
                                texto: "No es posible que una función tenga parámetros.",
                                esCorrecta: false
                            },
                            {
                                texto: "No se pueden llamar funciones dentro de otras funciones.",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 8,
                        enunciado: "¿Cuál es la principal ventaja de utilizar funciones en C++?",
                        retroalimentacion: "Las funciones permiten dividir el código en bloques reutilizables y organizados, lo que facilita el mantenimiento y la reutilización del código.",
                        respuestas: [
                            {
                                texto: "Hacen que el código sea más largo.",
                                esCorrecta: false
                            },
                            {
                                texto: "Permiten dividir el código en bloques reutilizables y organizados.",
                                esCorrecta: true
                            },
                            {
                                texto: "Aumentan el tiempo de ejecución del programa.",
                                esCorrecta: false
                            },
                            {
                                texto: "Solo se pueden utilizar dentro del main().",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 9,
                        enunciado: "¿Qué indica la palabra clave void en una función en C++?",
                        retroalimentacion: "La palabra clave void indica que la función no devuelve ningún valor, lo que es útil cuando la función realiza acciones pero no necesita retornar un resultado.",
                        respuestas: [
                            {
                                texto: "Que la función no devuelve ningún valor.",
                                esCorrecta: true
                            },
                            {
                                texto: "Que la función no recibe parámetros.",
                                esCorrecta: false
                            },
                            {
                                texto: "Que la función puede ser llamada sin argumentos.",
                                esCorrecta: false
                            },
                            {
                                texto: "Que la función no tiene una implementación.",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 10,
                        enunciado: "¿Cuál de las siguientes opciones es la forma correcta de declarar un array de 5 elementos en C++?",
                        retroalimentacion: "La declaración correcta es \"int numeros[5] = {1, 2, 3, 4, 5};\", lo cual especifica un array con 5 enteros inicializados.",
                        respuestas: [
                            {
                                texto: "array<int> numeros = {1, 2, 3, 4, 5};",
                                esCorrecta: false
                            },
                            {
                                texto: "int numeros[5] = {1, 2, 3, 4, 5};",
                                esCorrecta: true
                            },
                            {
                                texto: "int[5] numeros = {1, 2, 3, 4, 5};",
                                esCorrecta: false
                            },
                            {
                                texto: "numeros = {1, 2, 3, 4, 5};",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 11,
                        enunciado: "¿Cuál es el índice del último elemento en un array declarado como int valores[10];?",
                        retroalimentacion: "En un array de 10 elementos, el índice del último elemento es 9, ya que los índices empiezan desde 0.",
                        respuestas: [
                            {
                                texto: "10",
                                esCorrecta: false
                            },
                            {
                                texto: "9",
                                esCorrecta: true
                            },
                            {
                                texto: "11",
                                esCorrecta: false
                            },
                            {
                                texto: "0",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 12,
                        enunciado: "¿Cómo se accede al tercer elemento de un array arr en C++?",
                        retroalimentacion: "El tercer elemento de un array se accede usando el índice 2, ya que los índices en C++ comienzan desde 0.",
                        respuestas: [
                            {
                                texto: "arr(2)",
                                esCorrecta: false
                            },
                            {
                                texto: "arr[3]",
                                esCorrecta: false
                            },
                            {
                                texto: "arr[2]",
                                esCorrecta: true
                            },
                            {
                                texto: "arr{3}",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 13,
                        enunciado: "¿Qué almacena un puntero en C++?",
                        retroalimentacion: "Un puntero almacena la dirección de memoria de una variable, permitiendo el acceso directo a esa dirección para manipular el valor almacenado en ella.",
                        respuestas: [
                            {
                                texto: "El valor de una variable.",
                                esCorrecta: false
                            },
                            {
                                texto: "La dirección de memoria de una variable.",
                                esCorrecta: true
                            },
                            {
                                texto: "Un número aleatorio.",
                                esCorrecta: false
                            },
                            {
                                texto: "Un tipo de dato especial.",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 14,
                        enunciado: "Si ptr es un puntero a un entero, ¿cómo se obtiene el valor almacenado en la dirección de memoria a la que apunta?",
                        retroalimentacion: "Se puede obtener el valor de la dirección de memoria apuntada por el puntero usando el operador de desreferencia \"*\", por ejemplo, *ptr.",
                        respuestas: [
                            {
                                texto: "ptr->value",
                                esCorrecta: false
                            },
                            {
                                texto: "*ptr",
                                esCorrecta: true
                            },
                            {
                                texto: "&ptr",
                                esCorrecta: false
                            },
                            {
                                texto: "ptr.value",
                                esCorrecta: false
                            }
                        ]
                    },
                    {
                        numero: 15,
                        enunciado: "¿Cuál es la función del operador & en el contexto de punteros?",
                        retroalimentacion: "El operador \"&\" se utiliza para obtener la dirección de memoria de una variable, lo cual es necesario para trabajar con punteros.",
                        respuestas: [
                            {
                                texto: "Asignar un nuevo valor a un puntero.",
                                esCorrecta: false
                            },
                            {
                                texto: "Indicar que una variable es un puntero.",
                                esCorrecta: false
                            },
                            {
                                texto: "Obtener la dirección de memoria de una variable.",
                                esCorrecta: true
                            },
                            {
                                texto: "Declarar un puntero a una función.",
                                esCorrecta: false
                            }
                        ]
                    }
                ]
            }
        }, {
            // Para que entienda que estamos creando, no solo el Curso, sino también
            // sus Temas, Test, Preguntas, y Respuestas
            include: [
                {
                    model: Tema,
                    as: "temas",
                },
                {
                    model: Logro,
                    as: "logro"
                },
                {
                    model: Test,
                    as: "test",
                    include: [
                        {
                            model: Pregunta,
                            as: "preguntas",
                            include: [
                                {
                                    model: Respuesta,
                                    as: "respuestas"
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        // Creamos el recordatorio
        await Recordatorio.create({
            fecha: '2025-03-30',  
            email: 'ejemplo@email.com',  // El correo al que se enviará el recordatorio
            mensaje: 'Este es un recordatorio de prueba para verificar la funcionalidad.',
            asunto: 'Recordatorio Learn2Program'
        });

        console.log("Base de datos poblada");
    } catch (error) {
        console.error('Error al poblar la base de datos:', error);
    }
}

module.exports = seedDatabase;