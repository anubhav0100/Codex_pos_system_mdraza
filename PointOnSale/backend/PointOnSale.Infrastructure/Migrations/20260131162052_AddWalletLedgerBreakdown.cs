using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PointOnSale.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWalletLedgerBreakdown : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AdminCharges",
                table: "WalletLedgers",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Commission",
                table: "WalletLedgers",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TDS",
                table: "WalletLedgers",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "StockRequests",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FundRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FromScopeNodeId = table.Column<int>(type: "int", nullable: false),
                    ToScopeNodeId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProcessedByUserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FundRequests_ScopeNodes_FromScopeNodeId",
                        column: x => x.FromScopeNodeId,
                        principalTable: "ScopeNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FundRequests_ScopeNodes_ToScopeNodeId",
                        column: x => x.ToScopeNodeId,
                        principalTable: "ScopeNodes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StockRequests_CreatedByUserId",
                table: "StockRequests",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FundRequests_FromScopeNodeId",
                table: "FundRequests",
                column: "FromScopeNodeId");

            migrationBuilder.CreateIndex(
                name: "IX_FundRequests_ToScopeNodeId",
                table: "FundRequests",
                column: "ToScopeNodeId");

            migrationBuilder.AddForeignKey(
                name: "FK_StockRequests_AppUsers_CreatedByUserId",
                table: "StockRequests",
                column: "CreatedByUserId",
                principalTable: "AppUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockRequests_AppUsers_CreatedByUserId",
                table: "StockRequests");

            migrationBuilder.DropTable(
                name: "FundRequests");

            migrationBuilder.DropIndex(
                name: "IX_StockRequests_CreatedByUserId",
                table: "StockRequests");

            migrationBuilder.DropColumn(
                name: "AdminCharges",
                table: "WalletLedgers");

            migrationBuilder.DropColumn(
                name: "Commission",
                table: "WalletLedgers");

            migrationBuilder.DropColumn(
                name: "TDS",
                table: "WalletLedgers");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "StockRequests");
        }
    }
}
