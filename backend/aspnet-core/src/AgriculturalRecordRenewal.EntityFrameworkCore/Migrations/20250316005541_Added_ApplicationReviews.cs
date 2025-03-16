using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgriculturalRecordRenewal.Migrations
{
    /// <inheritdoc />
    public partial class Added_ApplicationReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppApplicationReviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ReviewerId = table.Column<string>(type: "TEXT", maxLength: 36, nullable: false),
                    ReviewerName = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    ReviewerRole = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    ReviewDate = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Decision = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Comment = table.Column<string>(type: "TEXT", maxLength: 1000, nullable: false),
                    CreationTime = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CreatorId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppApplicationReviews", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppApplicationReviews_ApplicationId",
                table: "AppApplicationReviews",
                column: "ApplicationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppApplicationReviews");
        }
    }
}
