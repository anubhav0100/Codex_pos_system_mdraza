FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["PointOnSale.Api/PointOnSale.Api.csproj", "PointOnSale.Api/"]
COPY ["PointOnSale.Application/PointOnSale.Application.csproj", "PointOnSale.Application/"]
COPY ["PointOnSale.Infrastructure/PointOnSale.Infrastructure.csproj", "PointOnSale.Infrastructure/"]
COPY ["PointOnSale.Domain/PointOnSale.Domain.csproj", "PointOnSale.Domain/"]
COPY ["PointOnSale.Shared/PointOnSale.Shared.csproj", "PointOnSale.Shared/"]

RUN dotnet restore "PointOnSale.Api/PointOnSale.Api.csproj"

# Copy everything else and build the app
COPY . .
WORKDIR "/src/PointOnSale.Api"
RUN dotnet build "PointOnSale.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PointOnSale.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "PointOnSale.Api.dll"]
