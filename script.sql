USE [NaceTuIdea]
GO
/****** Object:  Table [dbo].[__EFMigrationsHistory]    Script Date: 2/07/2025 5:09:12 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[__EFMigrationsHistory](
	[MigrationId] [nvarchar](150) NOT NULL,
	[ProductVersion] [nvarchar](32) NOT NULL,
 CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED 
(
	[MigrationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Disponibilidades]    Script Date: 2/07/2025 5:09:12 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Disponibilidades](
	[Id] [uniqueidentifier] NOT NULL,
	[Fecha] [datetime2](7) NOT NULL,
	[Disponible] [bit] NOT NULL,
	[LocalId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_Disponibilidades] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Favoritos]    Script Date: 2/07/2025 5:09:12 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Favoritos](
	[Id] [uniqueidentifier] NOT NULL,
	[UsuarioId] [uniqueidentifier] NOT NULL,
	[LocalId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_Favoritos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Locales]    Script Date: 2/07/2025 5:09:12 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Locales](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Description] [nvarchar](max) NOT NULL,
	[Costo] [decimal](18, 2) NOT NULL,
	[Ciudad] [nvarchar](max) NOT NULL,
	[Direccion] [nvarchar](255) NOT NULL,
	[Tipo] [nvarchar](max) NOT NULL,
	[Fotos] [nvarchar](max) NOT NULL,
	[PropietarioId] [uniqueidentifier] NOT NULL,
	[FechaCreacion] [datetime2](7) NOT NULL,
 CONSTRAINT [PK_Locales] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Local_NombreDireccionPropietario] UNIQUE NONCLUSTERED 
(
	[Name] ASC,
	[Direccion] ASC,
	[PropietarioId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Mensajes]    Script Date: 2/07/2025 5:09:12 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Mensajes](
	[Id] [uniqueidentifier] NOT NULL,
	[Contenido] [nvarchar](max) NOT NULL,
	[Fecha] [datetime2](7) NOT NULL,
	[RemitenteId] [uniqueidentifier] NOT NULL,
	[DestinatarioId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_Mensajes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Notificaciones]    Script Date: 2/07/2025 5:09:12 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Notificaciones](
	[Id] [uniqueidentifier] NOT NULL,
	[Titulo] [nvarchar](max) NOT NULL,
	[Mensaje] [nvarchar](max) NOT NULL,
	[Leido] [bit] NOT NULL,
	[Fecha] [datetime2](7) NOT NULL,
	[UsuarioId] [uniqueidentifier] NOT NULL,
 CONSTRAINT [PK_Notificaciones] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 2/07/2025 5:09:12 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[Id] [uniqueidentifier] NOT NULL,
	[Name] [nvarchar](max) NOT NULL,
	[Email] [nvarchar](max) NOT NULL,
	[Password] [nvarchar](max) NOT NULL,
	[Phone] [nvarchar](max) NOT NULL,
	[Propierty] [bit] NOT NULL,
 CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Valoraciones]    Script Date: 2/07/2025 5:09:12 p. m. ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Valoraciones](
	[Id] [uniqueidentifier] NOT NULL,
	[Estrellas] [int] NOT NULL,
	[LocalId] [uniqueidentifier] NOT NULL,
	[UsuarioId] [uniqueidentifier] NOT NULL,
	[Fecha] [datetime2](7) NOT NULL,
	[UserId] [uniqueidentifier] NULL,
 CONSTRAINT [PK_Valoraciones] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Locales] ADD  DEFAULT (getutcdate()) FOR [FechaCreacion]
GO
ALTER TABLE [dbo].[Disponibilidades]  WITH CHECK ADD  CONSTRAINT [FK_Disponibilidades_Locales_LocalId] FOREIGN KEY([LocalId])
REFERENCES [dbo].[Locales] ([Id])
GO
ALTER TABLE [dbo].[Disponibilidades] CHECK CONSTRAINT [FK_Disponibilidades_Locales_LocalId]
GO
ALTER TABLE [dbo].[Favoritos]  WITH CHECK ADD  CONSTRAINT [FK_Favoritos_Locales_LocalId] FOREIGN KEY([LocalId])
REFERENCES [dbo].[Locales] ([Id])
GO
ALTER TABLE [dbo].[Favoritos] CHECK CONSTRAINT [FK_Favoritos_Locales_LocalId]
GO
ALTER TABLE [dbo].[Favoritos]  WITH CHECK ADD  CONSTRAINT [FK_Favoritos_Users_UsuarioId] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Favoritos] CHECK CONSTRAINT [FK_Favoritos_Users_UsuarioId]
GO
ALTER TABLE [dbo].[Locales]  WITH CHECK ADD  CONSTRAINT [FK_Locales_Users_PropietarioId] FOREIGN KEY([PropietarioId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Locales] CHECK CONSTRAINT [FK_Locales_Users_PropietarioId]
GO
ALTER TABLE [dbo].[Mensajes]  WITH CHECK ADD  CONSTRAINT [FK_Mensajes_Users_DestinatarioId] FOREIGN KEY([DestinatarioId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Mensajes] CHECK CONSTRAINT [FK_Mensajes_Users_DestinatarioId]
GO
ALTER TABLE [dbo].[Mensajes]  WITH CHECK ADD  CONSTRAINT [FK_Mensajes_Users_RemitenteId] FOREIGN KEY([RemitenteId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Mensajes] CHECK CONSTRAINT [FK_Mensajes_Users_RemitenteId]
GO
ALTER TABLE [dbo].[Notificaciones]  WITH CHECK ADD  CONSTRAINT [FK_Notificaciones_Users_UsuarioId] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Notificaciones] CHECK CONSTRAINT [FK_Notificaciones_Users_UsuarioId]
GO
ALTER TABLE [dbo].[Valoraciones]  WITH CHECK ADD  CONSTRAINT [FK_Valoraciones_Locales_LocalId] FOREIGN KEY([LocalId])
REFERENCES [dbo].[Locales] ([Id])
GO
ALTER TABLE [dbo].[Valoraciones] CHECK CONSTRAINT [FK_Valoraciones_Locales_LocalId]
GO
ALTER TABLE [dbo].[Valoraciones]  WITH CHECK ADD  CONSTRAINT [FK_Valoraciones_Users_UserId] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Valoraciones] CHECK CONSTRAINT [FK_Valoraciones_Users_UserId]
GO
ALTER TABLE [dbo].[Valoraciones]  WITH CHECK ADD  CONSTRAINT [FK_Valoraciones_Users_UsuarioId] FOREIGN KEY([UsuarioId])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[Valoraciones] CHECK CONSTRAINT [FK_Valoraciones_Users_UsuarioId]
GO
