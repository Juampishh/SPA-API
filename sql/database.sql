CREATE DATABASE data_base_spa;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: data_base_spa
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `service_id` int NOT NULL,
  `appointment_date` datetime NOT NULL,
  `status` varchar(50) DEFAULT 'Scheduled',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `spa_services` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spa_services`
--

DROP TABLE IF EXISTS `spa_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spa_services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(50) NOT NULL,
  `service_name` varchar(100) NOT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `cost` decimal(10,2) NOT NULL,
  `duration` varchar(50) NOT NULL,
  `rating` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `spa_services_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spa_services`
--

LOCK TABLES `spa_services` WRITE;
/*!40000 ALTER TABLE `spa_services` DISABLE KEYS */;
INSERT INTO `spa_services` VALUES (1,'Masajes','Anti-stress','Relájate y olvida tus preocupaciones con nuestro masaje anti-stress.','masajes.jpg',50.00,'1 hora',4),(2,'Masajes','Descontracturantes','Alivia la tensión muscular con nuestro masaje descontracturante.','masajes-2.jpg',40.00,'45 minutos',5),(3,'Masajes','Masajes con piedras calientes','Disfruta del calor y la relajación profunda con masajes con piedras calientes.','masajes-3.jpg',30.00,'30 minutos',3),(4,'Masajes','Circulatorios','Mejora tu circulación y siente la revitalización con nuestros masajes circulatorios.','masaje-circulatorio.jpg',35.00,'40 minutos',4),(5,'Belleza','Lifting de pestaña','Realza tu mirada con nuestro lifting de pestañas.','lifting.jpg',60.00,'1 hora 15 minutos',5),(6,'Belleza','Depilación facial','Luce una piel suave y libre de vello con nuestra depilación facial.','depilacion-pestanas.jpg',55.00,'50 minutos',3),(7,'Belleza','Belleza de manos y pies','Mima tus manos y pies con nuestros tratamientos de belleza especializados.','manosypies.jpg',45.00,'1 hora',4),(8,'Tratamientos Faciales','Punta de Diamante','Revitaliza tu piel con nuestra microexfoliación con Punta de Diamante.','punta-de-diamante.jpg',70.00,'1 hora 30 minutos',5),(9,'Tratamientos Faciales','Limpieza profunda + Hidratación','Limpia y humecta tu piel con nuestra limpieza profunda e hidratación.','limpieza-profunda.jpg',65.00,'1 hora',2),(10,'Tratamientos Faciales','Crio frecuencia facial','Experimenta el \"SHOCK TERMICO\" y consigue un lifting instantáneo con nuestra Crio frecuencia facial.','masajes.jpg',75.00,'1 hora 20 minutos',4),(11,'Tratamientos Corporales','VelaSlim','Reduce tu circunferencia corporal y la celulitis con VelaSlim.','velaslim.jpg',85.00,'2 horas',5),(12,'Tratamientos Corporales','DermoHealth','Estimula la microcirculación y realiza un drenaje linfático con DermoHealth.','dermo-health.jpg',90.00,'1 hora 45 minutos',3),(13,'Tratamientos Corporales','Criofrecuencia','Logra un efecto lifting instantáneo con nuestra Criofrecuencia corporal.','masajes.jpg',100.00,'2 horas 30 minutos',4),(14,'Tratamientos Corporales','Ultracavitación','Reduce medidas de forma efectiva con nuestra técnica de Ultracavitación.','masajes.jpg',110.00,'3 horas',5);
/*!40000 ALTER TABLE `spa_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` varchar(100) NOT NULL DEFAULT 'client',
  `username` varchar(100) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `users_chk_1` CHECK ((`type` in (_utf8mb4'admin',_utf8mb4'client')))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','juampi123','Juan Pablo','Merino','juampimerino55@gmail.com','juampi999','2024-08-07 21:42:36'),(2,'client','carlos','Carlos','Gomez','carlozgomex@hotmail.com','juampi1234','2024-08-09 20:46:25'),(3,'client','jesus','Jesus','Gomez','jesusitoxd@gmail.com','juampi123','2024-08-09 20:50:33');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-08-17 14:25:15


/*DATOS DE SERVICIOS*/
INSERT INTO spa_services (category, service_name, description, image_url) VALUES
('Masajes', 'Anti-stress', 'Relájate y olvida tus preocupaciones con nuestro masaje anti-stress.', '/images/anti_stress.jpg'),
('Masajes', 'Descontracturantes', 'Alivia la tensión muscular con nuestro masaje descontracturante.', '/images/descontracturantes.jpg'),
('Masajes', 'Masajes con piedras calientes', 'Disfruta del calor y la relajación profunda con masajes con piedras calientes.', '/images/piedras_calientes.jpg'),
('Masajes', 'Circulatorios', 'Mejora tu circulación y siente la revitalización con nuestros masajes circulatorios.', '/images/circulatorios.jpg'),
('Belleza', 'Lifting de pestaña', 'Realza tu mirada con nuestro lifting de pestañas.', '/images/lifting_pestana.jpg'),
('Belleza', 'Depilación facial', 'Luce una piel suave y libre de vello con nuestra depilación facial.', '/images/depilacion_facial.jpg'),
('Belleza', 'Belleza de manos y pies', 'Mima tus manos y pies con nuestros tratamientos de belleza especializados.', '/images/belleza_manos_pies.jpg'),
('Tratamientos Faciales', 'Punta de Diamante', 'Revitaliza tu piel con nuestra microexfoliación con Punta de Diamante.', '/images/punta_diamante.jpg'),
('Tratamientos Faciales', 'Limpieza profunda + Hidratación', 'Limpia y humecta tu piel con nuestra limpieza profunda e hidratación.', '/images/limpieza_hidratacion.jpg'),
('Tratamientos Faciales', 'Crio frecuencia facial', 'Experimenta el "SHOCK TERMICO" y consigue un lifting instantáneo con nuestra Crio frecuencia facial.', '/images/crio_frecuencia_facial.jpg'),
('Tratamientos Corporales', 'VelaSlim', 'Reduce tu circunferencia corporal y la celulitis con VelaSlim.', '/images/velaslim.jpg'),
('Tratamientos Corporales', 'DermoHealth', 'Estimula la microcirculación y realiza un drenaje linfático con DermoHealth.', '/images/dermohealth.jpg'),
('Tratamientos Corporales', 'Criofrecuencia', 'Logra un efecto lifting instantáneo con nuestra Criofrecuencia corporal.', '/images/criofrecuencia.jpg'),
('Tratamientos Corporales', 'Ultracavitación', 'Reduce medidas de forma efectiva con nuestra técnica de Ultracavitación.', '/images/ultracavitacion.jpg');
