-- ============================================================
-- OPENVIEW LMS — Preguntas de arrastre en las evaluaciones
-- Ya aplicado en producción; se conserva como registro y para
-- poder reconstruir el estado en otro entorno.
-- ============================================================
--
-- Cada evaluación queda con 5 preguntas: 2 de opción múltiple (las dos
-- primeras que ya existían), 2 de relacionar y 1 de ordenar.
--
-- Las preguntas viven como JSON dentro de lessons.content. Las de arrastre
-- llevan campo "type" ('match' u 'order'); las de opción múltiple no lo llevan,
-- y por eso el formato antiguo sigue siendo válido.

-- ── Respaldo del quiz original, previo a la reescritura ──
-- Permite revertir: UPDATE lessons SET content = jsonb_set(...) desde aquí.
CREATE TABLE IF NOT EXISTS public.lessons_quiz_backup (
    lesson_id    uuid PRIMARY KEY REFERENCES public.lessons(id) ON DELETE CASCADE,
    quiz         jsonb NOT NULL,
    backed_up_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons_quiz_backup ENABLE ROW LEVEL SECURITY;

INSERT INTO public.lessons_quiz_backup (lesson_id, quiz)
SELECT id, (content::jsonb)->'quiz'
FROM public.lessons
WHERE (content::jsonb) ? 'quiz'
ON CONFLICT (lesson_id) DO NOTHING;

-- ── Reescritura de las 16 evaluaciones ──
-- Conserva las 2 primeras preguntas del respaldo y añade las 3 de arrastre,
-- redactadas a partir de los temas de cada sesión (las de CNDJ hablan de
-- Microsoft 365; las de TURGAS, de Drive, Gmail y Airtable).

UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada herramienta del taller con lo que hace", "pairs": [{"left": "Google Colab", "right": "Entrenar un modelo propio paso a paso"}, {"left": "Ollama", "right": "Ejecutar un modelo de lenguaje en tu propio equipo"}, {"left": "Claude + MCP", "right": "Modelo en la nube que invoca herramientas externas"}]}, {"type": "match", "question": "Relaciona cada concepto con su definición", "pairs": [{"left": "Token", "right": "Unidad en que el modelo divide y procesa el texto"}, {"left": "Ventana de contexto", "right": "Cantidad de texto que el modelo considera a la vez"}, {"left": "Tool use", "right": "Decisión del modelo de invocar una herramienta"}]}, {"type": "order", "question": "Ordena lo que ocurre cuando Claude usa una herramienta", "items": ["El usuario escribe una petición", "El modelo decide que necesita una herramienta", "La herramienta se ejecuta y devuelve datos", "El modelo redacta la respuesta con esos datos"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = 'e0a54541-a6ce-4c82-992b-68216e872bfb';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada aplicación de Office con su uso de Claude", "pairs": [{"left": "Word", "right": "Redacción y revisión con control de cambios"}, {"left": "Excel", "right": "Fórmulas y análisis de datos"}, {"left": "PowerPoint", "right": "Generación de diapositivas nativas"}]}, {"type": "match", "question": "Relaciona cada recurso de Claude.ai con para qué sirve", "pairs": [{"left": "Proyecto", "right": "Espacio de trabajo con instrucciones persistentes"}, {"left": "Artifact", "right": "Documento o prototipo reutilizable"}, {"left": "Salida estructurada", "right": "Resultado que otros sistemas pueden reutilizar"}]}, {"type": "order", "question": "Ordena la instalación del complemento de Claude en Office", "items": ["Entrar a Microsoft AppSource", "Instalar el complemento Claude by Anthropic", "Iniciar sesión con la cuenta de Microsoft 365", "Usar Claude dentro de Word, Excel o PowerPoint"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = '33972e13-89e9-4e15-9c27-f11b877b49ec';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada conector MCP con lo que permite hacer", "pairs": [{"left": "Microsoft 365", "right": "Buscar y leer documentos en SharePoint y OneDrive"}, {"left": "Outlook", "right": "Clasificar y redactar correspondencia"}, {"left": "Base interna", "right": "Leer registros de una base ya existente"}]}, {"type": "match", "question": "Relaciona cada nivel de permiso con su alcance", "pairs": [{"left": "Solo lectura", "right": "Consultar sin modificar nada"}, {"left": "Lectura y escritura", "right": "Puede guardar cambios en la fuente"}, {"left": "Fuera de alcance", "right": "Información con reserva legal"}]}, {"type": "order", "question": "Ordena la configuración de un conector MCP", "items": ["Elegir el conector que se necesita", "Autorizar el acceso con la cuenta institucional", "Definir el alcance de permisos", "Probarlo con una búsqueda real"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = '94a9ebd6-dda1-4373-b6ea-ebc713336478';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada pieza de la base de datos con lo que es", "pairs": [{"left": "Tabla", "right": "Conjunto de registros del mismo tipo"}, {"left": "Campo", "right": "Dato concreto dentro de cada registro"}, {"left": "Vista", "right": "Forma filtrada de mirar la misma tabla"}]}, {"type": "match", "question": "Relaciona cada forma de uso desde el celular", "pairs": [{"left": "Formulario", "right": "Capturar datos en campo"}, {"left": "Vista compartida", "right": "Consultar registros desde el teléfono"}, {"left": "Consulta conversacional", "right": "Preguntar por los datos en lenguaje natural"}]}, {"type": "order", "question": "Ordena el montaje de la base de datos", "items": ["Diseñar las tablas y los campos", "Migrar los datos desde Excel", "Verificar que los registros quedaron correctos", "Compartir la vista para consultarla desde el móvil"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = 'd5f12180-546f-4eb6-8d82-c98a0f3b6968';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada momento de la delegación con lo que haces", "pairs": [{"left": "Antes de ejecutar", "right": "Revisar el plan que propone el agente"}, {"left": "Durante la ejecución", "right": "Aprobar los pasos críticos"}, {"left": "Al terminar", "right": "Guardarla como rutina repetible"}]}, {"type": "match", "question": "Relaciona cada elemento de Cowork con su papel", "pairs": [{"left": "Claude Cowork", "right": "Delegar trabajo completo, no solo preguntas"}, {"left": "Conectores MCP", "right": "Dar acceso a Microsoft 365 y las bases internas"}, {"left": "Automatización recurrente", "right": "Repetir la tarea con instrucciones guardadas"}]}, {"type": "order", "question": "Ordena la delegación de una tarea en Cowork", "items": ["Describir el objetivo de la tarea", "Revisar el plan propuesto por el agente", "Supervisar la ejecución y corregir", "Convertir el resultado en una rutina"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = 'c6f2b08b-d186-4dae-a217-95dd5187ae6f';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada recurso con lo que es", "pairs": [{"left": "CLI", "right": "Dar instrucciones por texto en la terminal"}, {"left": "Skill", "right": "Capacidad reutilizable que Claude aplica sola"}, {"left": "Proyecto", "right": "Espacio con contexto persistente"}]}, {"type": "match", "question": "Relaciona cada parte de un agente con su función", "pairs": [{"left": "Objetivo", "right": "Qué debe lograr el agente"}, {"left": "Herramientas", "right": "Con qué cuenta para lograrlo"}, {"left": "Verificación humana", "right": "Dónde se detiene y pregunta"}]}, {"type": "order", "question": "Ordena la creación de una Skill", "items": ["Definir cuándo debe activarse", "Escribir las instrucciones que sigue", "Añadir las plantillas de referencia", "Probarla en una tarea real"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = '8beddbcc-2059-4472-9d05-a5deb4d56272';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada forma de operar desde el móvil", "pairs": [{"left": "Dispatch", "right": "Lanzar una tarea desde el celular"}, {"left": "Tarea programada", "right": "Se ejecuta sola en un horario fijo"}, {"left": "Orquestación", "right": "Un agente reparte subtareas entre otros"}]}, {"type": "match", "question": "Relaciona cada disparador de n8n con un ejemplo", "pairs": [{"left": "Horario", "right": "Un reporte cada lunes por la mañana"}, {"left": "Correo entrante", "right": "Llega una solicitud y se clasifica"}, {"left": "Mensaje de Telegram", "right": "Alguien pregunta por un dato desde el chat"}]}, {"type": "order", "question": "Ordena el armado de un bot en n8n", "items": ["Elegir el disparador que lo activa", "Conectar Claude al flujo", "Definir cómo entrega el resultado", "Probarlo de extremo a extremo"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = '783e537f-3c1a-40ae-b6e1-e61b62737e0e';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada entregable del cierre con su contenido", "pairs": [{"left": "Mapa de flujos", "right": "Qué tareas repetitivas hay y cuáles se automatizaron"}, {"left": "Documentación", "right": "Herramientas, permisos y límites de cada agente"}, {"left": "Hoja de ruta", "right": "Qué escalar primero y con qué gobierno de datos"}]}, {"type": "match", "question": "Relaciona cada criterio de calidad con lo que verifica", "pairs": [{"left": "Datos reales", "right": "Que el agente funcione de extremo a extremo"}, {"left": "Manejo de errores", "right": "Qué hace el bot si la fuente falla"}, {"left": "Gobierno de datos", "right": "Quién aprueba qué y hasta dónde llega el agente"}]}, {"type": "order", "question": "Ordena el trabajo de cierre del programa", "items": ["Mapear los flujos de trabajo repetitivos", "Ajustar los 3 agentes sobre datos reales", "Documentar herramientas, permisos y límites", "Entregar la hoja de ruta de automatización"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = '63eefdc4-37a9-412c-9618-19316ed1f97b';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada herramienta del taller con lo que hace", "pairs": [{"left": "Google Colab", "right": "Entrenar un modelo propio paso a paso"}, {"left": "Ollama", "right": "Ejecutar un modelo de lenguaje en tu propio equipo"}, {"left": "Claude + MCP", "right": "Modelo en la nube que invoca herramientas externas"}]}, {"type": "match", "question": "Relaciona cada concepto con su definición", "pairs": [{"left": "Token", "right": "Unidad en que el modelo divide y procesa el texto"}, {"left": "Ventana de contexto", "right": "Cantidad de texto que el modelo considera a la vez"}, {"left": "Tool use", "right": "Decisión del modelo de invocar una herramienta"}]}, {"type": "order", "question": "Ordena lo que ocurre cuando Claude usa una herramienta", "items": ["El usuario escribe una petición", "El modelo decide que necesita una herramienta", "La herramienta se ejecuta y devuelve datos", "El modelo redacta la respuesta con esos datos"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = 'a125f691-f469-4f31-9242-26954112b87b';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada herramienta del ecosistema Google con su uso", "pairs": [{"left": "Gemini en Workspace", "right": "Asistencia dentro de Docs, Sheets y Gmail"}, {"left": "NotebookLM", "right": "Síntesis anclada a tus propios documentos"}, {"left": "Gems", "right": "Asistentes personalizados para tareas puntuales"}]}, {"type": "match", "question": "Relaciona cada recurso de Claude.ai con para qué sirve", "pairs": [{"left": "Proyecto", "right": "Espacio de trabajo con instrucciones persistentes"}, {"left": "Artifact", "right": "Documento o prototipo reutilizable"}, {"left": "Salida estructurada", "right": "Resultado que otros sistemas pueden reutilizar"}]}, {"type": "order", "question": "Ordena los pasos de un análisis certero", "items": ["Definir la pregunta concreta", "Aportar los documentos fuente", "Pedir cifras trazables y supuestos explícitos", "Verificar el resultado contra la fuente"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = '1455e656-503f-4001-8639-be00229e43f9';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada conector MCP con lo que permite hacer", "pairs": [{"left": "Google Drive", "right": "Buscar y leer documentos de la organización"}, {"left": "Gmail", "right": "Clasificar y redactar correspondencia"}, {"left": "Airtable", "right": "Leer registros de una base ya existente"}]}, {"type": "match", "question": "Relaciona cada nivel de permiso con su alcance", "pairs": [{"left": "Solo lectura", "right": "Consultar sin modificar nada"}, {"left": "Lectura y escritura", "right": "Puede guardar cambios en la fuente"}, {"left": "Fuera de alcance", "right": "Información que no se expone al agente"}]}, {"type": "order", "question": "Ordena la configuración de un conector MCP", "items": ["Elegir el conector que se necesita", "Autorizar el acceso con la cuenta de la organización", "Definir el alcance de permisos", "Probarlo con una búsqueda real"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = '02f19f92-1eac-4a23-85d0-b50bf17cb0cb';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada pieza de la base de datos con lo que es", "pairs": [{"left": "Tabla", "right": "Conjunto de registros del mismo tipo"}, {"left": "Campo", "right": "Dato concreto dentro de cada registro"}, {"left": "Vista", "right": "Forma filtrada de mirar la misma tabla"}]}, {"type": "match", "question": "Relaciona cada forma de uso desde el celular", "pairs": [{"left": "Formulario", "right": "Capturar datos en campo"}, {"left": "Vista compartida", "right": "Consultar registros desde el teléfono"}, {"left": "Consulta conversacional", "right": "Preguntar por los datos en lenguaje natural"}]}, {"type": "order", "question": "Ordena el montaje de la base de datos", "items": ["Diseñar las tablas y los campos", "Migrar los datos desde Excel", "Verificar que los registros quedaron correctos", "Compartir la vista para consultarla desde el móvil"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = 'bf01c08c-ce49-4ac2-a18a-19682fa39e9e';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada momento de la delegación con lo que haces", "pairs": [{"left": "Antes de ejecutar", "right": "Revisar el plan que propone el agente"}, {"left": "Durante la ejecución", "right": "Aprobar los pasos críticos"}, {"left": "Al terminar", "right": "Guardarla como rutina repetible"}]}, {"type": "match", "question": "Relaciona cada elemento de Cowork con su papel", "pairs": [{"left": "Claude Cowork", "right": "Delegar trabajo completo, no solo preguntas"}, {"left": "Conectores MCP", "right": "Dar acceso a Drive, correo y Airtable"}, {"left": "Automatización recurrente", "right": "Repetir la tarea con instrucciones guardadas"}]}, {"type": "order", "question": "Ordena la delegación de una tarea en Cowork", "items": ["Describir el objetivo de la tarea", "Revisar el plan propuesto por el agente", "Supervisar la ejecución y corregir", "Convertir el resultado en una rutina"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = 'f0f22d32-c577-48fb-89f7-8eea5ac6e2f5';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada recurso con lo que es", "pairs": [{"left": "CLI", "right": "Dar instrucciones por texto en la terminal"}, {"left": "Skill", "right": "Capacidad reutilizable que Claude aplica sola"}, {"left": "Proyecto", "right": "Espacio con contexto persistente"}]}, {"type": "match", "question": "Relaciona cada parte de un agente con su función", "pairs": [{"left": "Objetivo", "right": "Qué debe lograr el agente"}, {"left": "Herramientas", "right": "Con qué cuenta para lograrlo"}, {"left": "Verificación humana", "right": "Dónde se detiene y pregunta"}]}, {"type": "order", "question": "Ordena la creación de una Skill", "items": ["Definir cuándo debe activarse", "Escribir las instrucciones que sigue", "Añadir las plantillas de referencia", "Probarla en una tarea real"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = '8da64d9f-0d68-4c8e-89f6-cacf8c3fb14f';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada forma de operar desde el móvil", "pairs": [{"left": "Dispatch", "right": "Lanzar una tarea desde el celular"}, {"left": "Tarea programada", "right": "Se ejecuta sola en un horario fijo"}, {"left": "Orquestación", "right": "Un agente reparte subtareas entre otros"}]}, {"type": "match", "question": "Relaciona cada disparador de n8n con un ejemplo", "pairs": [{"left": "Horario", "right": "Un reporte cada lunes por la mañana"}, {"left": "Correo entrante", "right": "Llega una solicitud y se clasifica"}, {"left": "Mensaje de Telegram", "right": "Alguien pregunta por un dato desde el chat"}]}, {"type": "order", "question": "Ordena el armado de un bot en n8n", "items": ["Elegir el disparador que lo activa", "Conectar Claude al flujo", "Definir cómo entrega el resultado", "Probarlo de extremo a extremo"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = '5cc1518c-8331-42de-a507-e58701dce1a8';
UPDATE public.lessons l
SET content = ((l.content::jsonb) || jsonb_build_object(
      'quiz',
      (SELECT jsonb_agg(e) FROM (
         SELECT e FROM jsonb_array_elements(b.quiz) e LIMIT 2
       ) t)
      || '[{"type": "match", "question": "Relaciona cada entregable del cierre con su contenido", "pairs": [{"left": "Mapa de flujos", "right": "Qué tareas repetitivas hay y cuáles se automatizaron"}, {"left": "Documentación", "right": "Herramientas, permisos y límites de cada agente"}, {"left": "Hoja de ruta", "right": "Qué escalar primero y con qué gobierno de datos"}]}, {"type": "match", "question": "Relaciona cada criterio de calidad con lo que verifica", "pairs": [{"left": "Datos reales", "right": "Que el agente funcione de extremo a extremo"}, {"left": "Manejo de errores", "right": "Qué hace el bot si la fuente falla"}, {"left": "Gobierno de datos", "right": "Quién aprueba qué y hasta dónde llega el agente"}]}, {"type": "order", "question": "Ordena el trabajo de cierre del programa", "items": ["Mapear los flujos de trabajo repetitivos", "Ajustar los 3 agentes sobre datos reales", "Documentar herramientas, permisos y límites", "Entregar la hoja de ruta de automatización"]}]'::jsonb
    ))::text
FROM public.lessons_quiz_backup b
WHERE b.lesson_id = l.id AND l.id = 'e0522f0c-6f14-4f2c-98d5-e6093cff9442';
